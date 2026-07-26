import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { emailService } from '../../services/email.service';
import { notificationsService } from '../notifications/notifications.service';
import type { EditorDecisionInput, AssignReviewerInput } from '../submissions/submissions.schemas';

// ─── Assign reviewer ──────────────────────────────────────────────────────────

export async function assignReviewer(submissionId: string, editorId: string, input: AssignReviewerInput) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { journal: true },
  });
  if (!submission) throw new AppError(404, 'Submission not found');

  if (!['SUBMITTED', 'UNDER_REVIEW', 'REVISED'].includes(submission.status)) {
    throw new AppError(400, `Cannot assign reviewer when status is ${submission.status}`);
  }

  const reviewer = await prisma.user.findUnique({ where: { id: input.reviewerId } });
  if (!reviewer) throw new AppError(404, 'Reviewer not found');
  if (!['REVIEWER', 'EDITOR', 'ADMIN'].includes(reviewer.role)) {
    throw new AppError(400, 'User is not a reviewer');
  }

  // Prevent duplicate assignment
  const existing = await prisma.reviewAssignment.findFirst({
    where: { submissionId, reviewerId: input.reviewerId, status: { not: 'DECLINED' } },
  });
  if (existing) throw new AppError(409, 'Reviewer already assigned to this submission');

  const dueDate = input.dueDate ? new Date(input.dueDate) : undefined;

  const assignment = await prisma.$transaction(async (tx) => {
    const a = await tx.reviewAssignment.create({
      data: { submissionId, reviewerId: input.reviewerId, dueDate },
    });
    await tx.submission.update({
      where: { id: submissionId },
      data: { status: 'UNDER_REVIEW' },
    });
    await tx.submissionEvent.create({
      data: {
        submissionId,
        actorId: editorId,
        type: 'REVIEWER_ASSIGNED',
        note: `Reviewer ${reviewer.name} assigned`,
      },
    });
    return a;
  });

  // Notify reviewer via email + in-app
  await emailService.sendReviewAssigned({
    to: reviewer.email,
    name: reviewer.name,
    title: submission.title,
    dueDate: dueDate ? dueDate.toDateString() : 'As soon as possible',
    journalName: submission.journal.name,
  });

  await notificationsService.create({
    userId: input.reviewerId,
    type: 'REVIEW_ASSIGNED',
    title: 'New review assignment',
    body: `You have been assigned to review: "${submission.title}"`,
    link: `/reviewer/assignments/${assignment.id}`,
  });

  return assignment;
}

// ─── Make editorial decision ──────────────────────────────────────────────────

export async function makeDecision(submissionId: string, editorId: string, input: EditorDecisionInput) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { author: true, journal: true },
  });
  if (!submission) throw new AppError(404, 'Submission not found');

  if (!['UNDER_REVIEW', 'WITH_EDITOR', 'REVISED'].includes(submission.status)) {
    throw new AppError(400, `Cannot make a decision when status is ${submission.status}`);
  }

  const statusMap = {
    ACCEPTED: 'ACCEPTED',
    REVISION_NEEDED: 'REVISION_NEEDED',
    REJECTED: 'REJECTED',
  } as const;

  await prisma.$transaction([
    prisma.submission.update({
      where: { id: submissionId },
      data: {
        status: statusMap[input.decision],
        editorNote: input.note,
      },
    }),
    prisma.submissionEvent.create({
      data: {
        submissionId,
        actorId: editorId,
        type: 'DECISION_MADE',
        note: `Decision: ${input.decision}. ${input.note ?? ''}`,
      },
    }),
  ]);

  // Notify author via email + in-app
  await emailService.sendDecision({
    to: submission.author.email,
    name: submission.author.name,
    title: submission.title,
    decision: input.decision,
    note: input.note,
    journalName: submission.journal.name,
  });

  await notificationsService.create({
    userId: submission.authorId,
    type: 'DECISION_MADE',
    title: 'Editorial decision on your submission',
    body: `Decision for "${submission.title}": ${input.decision.replace('_', ' ')}`,
    link: `/author/submissions/${submissionId}`,
  });
}

// ─── View all reviews for a submission ───────────────────────────────────────

export async function getSubmissionReviews(submissionId: string) {
  return prisma.reviewAssignment.findMany({
    where: { submissionId },
    include: {
      reviewer: { select: { id: true, name: true, email: true } },
      review: true,
    },
    orderBy: { assignedAt: 'asc' },
  });
}
