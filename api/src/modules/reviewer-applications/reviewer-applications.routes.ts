import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { validateBody } from '../../middleware/validate';
import { requireAuth, requireRole } from '../../middleware/auth';
import { createApplicationSchema, updateApplicationStatusSchema } from './reviewer-applications.schemas';
import * as applicationController from './reviewer-applications.controller';

export const reviewerApplicationsRouter = Router();

// Public endpoint (can also be called when logged in as author)
reviewerApplicationsRouter.post(
  '/', 
  validateBody(createApplicationSchema), 
  asyncHandler(applicationController.createApplicationHandler)
);

// Admin / Editor only endpoints
// These will be mounted under /admin/reviewer-applications, but we'll export them here or handle in admin module.
// Actually, it's better to keep the routes related to the module here, and mount them directly.
// But the plan says:
// GET /api/admin/reviewer-applications
// PATCH /api/admin/reviewer-applications/:id
// Let's mount these here but protect them with requireRole('ADMIN', 'EDITOR')

reviewerApplicationsRouter.get(
  '/', 
  requireAuth,
  requireRole('ADMIN', 'EDITOR'), // allow editors to see applications too
  asyncHandler(applicationController.listApplicationsHandler)
);

reviewerApplicationsRouter.patch(
  '/:id', 
  requireAuth,
  requireRole('ADMIN'), // only admin can approve/reject
  validateBody(updateApplicationStatusSchema), 
  asyncHandler(applicationController.updateApplicationStatusHandler)
);
