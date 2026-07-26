import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { submitReviewSchema } from '../submissions/submissions.schemas';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { notificationsService } from '../notifications/notifications.service';
import { supplementaryUpload } from '../../services/storage.service';

export const reviewAssignmentsRouter = Router();

// ─── Reviewer routes ──────────────────────────────────────────────────────────

// List my assignments
reviewAssignmentsRouter.get(
  '/',
  requireAuth,
  requireRole('REVIEWER', 'EDITOR', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const assignments = await prisma.reviewAssignment.findMany({
      where: { reviewerId: req.user!.sub },
      include: {
        submission: {
          select: {
            id: true,
            title: true,
            abstract: true,
            keywords: true,
            journal: { select: { name: true, slug: true } },
            subject: { select: { name: true } },
          },
        },
        review: true,
      },
      orderBy: { assignedAt: 'desc' },
    });
    res.json(assignments);
  }),
);

// Get single assignment
reviewAssignmentsRouter.get(
  '/:id',
  requireAuth,
  requireRole('REVIEWER', 'EDITOR', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const assignment = await prisma.reviewAssignment.findUnique({
      where: { id },
      include: {
        submission: {
          select: {
            id: true,
            title: true,
            abstract: true,
            keywords: true,
            coAuthors: { orderBy: { order: 'asc' } },
            // Only expose the manuscript file — not internal files
            files: { where: { type: { in: ['MANUSCRIPT', 'SUPPLEMENTARY'] } } },
            journal: { select: { name: true } },
          },
        },
        review: true,
      },
    });
    if (!assignment) throw new AppError(404, 'Assignment not found');
    if (assignment.reviewerId !== req.user!.sub) throw new AppError(403, 'Forbidden');
    res.json(assignment);
  }),
);

// Accept assignment
reviewAssignmentsRouter.post(
  '/:id/accept',
  requireAuth,
  requireRole('REVIEWER', 'EDITOR', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const assignment = await prisma.reviewAssignment.findUnique({ where: { id } });
    if (!assignment) throw new AppError(404, 'Assignment not found');
    if (assignment.reviewerId !== req.user!.sub) throw new AppError(403, 'Forbidden');
    if (assignment.status !== 'PENDING') throw new AppError(400, 'Assignment is not pending');

    const updated = await prisma.reviewAssignment.update({
      where: { id },
      data: { status: 'ACCEPTED' },
    });
    res.json(updated);
  }),
);

// Decline assignment
reviewAssignmentsRouter.post(
  '/:id/decline',
  requireAuth,
  requireRole('REVIEWER', 'EDITOR', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const { reason } = req.body as { reason?: string };
    const assignment = await prisma.reviewAssignment.findUnique({
      where: { id },
      include: { submission: { select: { title: true } } },
    });
    if (!assignment) throw new AppError(404, 'Assignment not found');
    if (assignment.reviewerId !== req.user!.sub) throw new AppError(403, 'Forbidden');
    if (assignment.status !== 'PENDING') throw new AppError(400, 'Assignment is not pending');

    await prisma.reviewAssignment.update({
      where: { id },
      data: { status: 'DECLINED', declineReason: reason },
    });

    // Notify editors
    const editors = await prisma.user.findMany({ where: { role: { in: ['EDITOR', 'ADMIN'] } } });
    for (const editor of editors) {
      await notificationsService.create({
        userId: editor.id,
        type: 'GENERAL',
        title: 'Reviewer declined assignment',
        body: `A reviewer declined to review "${assignment.submission.title}"`,
        link: `/editor/submissions/${assignment.submissionId}`,
      });
    }

    res.json({ message: 'Assignment declined' });
  }),
);

// Submit review
reviewAssignmentsRouter.post(
  '/:id/submit',
  requireAuth,
  requireRole('REVIEWER', 'EDITOR', 'ADMIN'),
  supplementaryUpload.single('annotatedFile'),
  validateBody(submitReviewSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const assignment = await prisma.reviewAssignment.findUnique({
      where: { id },
      include: {
        submission: { include: { journal: true } },
      },
    });
    if (!assignment) throw new AppError(404, 'Assignment not found');
    if (assignment.reviewerId !== req.user!.sub) throw new AppError(403, 'Forbidden');
    if (assignment.status === 'DECLINED') throw new AppError(400, 'Assignment was declined');
    if (assignment.status === 'COMPLETED') throw new AppError(409, 'Review already submitted');

    const review = await prisma.$transaction(async (tx) => {
      const r = await tx.review.create({
        data: {
          assignmentId: id,
          ...req.body,
          annotatedFilePath: (req.file as any)?.location || req.file?.path,
        },
      });
      await tx.reviewAssignment.update({
        where: { id },
        data: { status: 'COMPLETED' },
      });
      // Check if all active assignments are completed → move to WITH_EDITOR
      const pending = await tx.reviewAssignment.count({
        where: {
          submissionId: assignment.submissionId,
          status: { in: ['PENDING', 'ACCEPTED'] },
        },
      });
      if (pending === 0) {
        await tx.submission.update({
          where: { id: assignment.submissionId },
          data: { status: 'WITH_EDITOR' },
        });
        await tx.submissionEvent.create({
          data: {
            submissionId: assignment.submissionId,
            type: 'ALL_REVIEWS_IN',
            note: 'All reviewer reports received — ready for editorial decision',
          },
        });
      }
      return r;
    });

    // Notify editors
    const editors = await prisma.user.findMany({ where: { role: { in: ['EDITOR', 'ADMIN'] } } });
    for (const editor of editors) {
      await notificationsService.create({
        userId: editor.id,
        type: 'REVIEW_SUBMITTED',
        title: 'Review submitted',
        body: `A review has been submitted for "${assignment.submission.title}"`,
        link: `/editor/submissions/${assignment.submissionId}`,
      });
    }

    res.status(201).json(review);
  }),
);
