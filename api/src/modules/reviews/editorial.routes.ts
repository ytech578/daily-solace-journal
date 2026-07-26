import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { editorDecisionSchema, assignReviewerSchema } from '../submissions/submissions.schemas';
import * as editorialService from './editorial.service';

export const editorialRouter = Router();

// All editorial routes require EDITOR or ADMIN role

editorialRouter.post(
  '/:id/assign-reviewer',
  requireAuth,
  requireRole('EDITOR', 'ADMIN'),
  validateBody(assignReviewerSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const assignment = await editorialService.assignReviewer(id, req.user!.sub, req.body);
    res.status(201).json(assignment);
  }),
);

editorialRouter.post(
  '/:id/decision',
  requireAuth,
  requireRole('EDITOR', 'ADMIN'),
  validateBody(editorDecisionSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    await editorialService.makeDecision(id, req.user!.sub, req.body);
    res.json({ message: 'Decision recorded and author notified' });
  }),
);

editorialRouter.get(
  '/:id/reviews',
  requireAuth,
  requireRole('EDITOR', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const reviews = await editorialService.getSubmissionReviews(id);
    res.json(reviews);
  }),
);
