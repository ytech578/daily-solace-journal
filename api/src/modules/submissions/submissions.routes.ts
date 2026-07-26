import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { manuscriptUpload } from '../../services/storage.service';
import { createSubmissionSchema, updateSubmissionSchema, submitRevisionSchema } from './submissions.schemas';
import * as submissionsController from './submissions.controller';

export const submissionsRouter = Router();

// ─── Author routes ────────────────────────────────────────────────────────────

submissionsRouter.post(
  '/',
  requireAuth,
  validateBody(createSubmissionSchema),
  asyncHandler(submissionsController.createDraftHandler),
);

submissionsRouter.get(
  '/mine',
  requireAuth,
  asyncHandler(submissionsController.listMySubmissionsHandler),
);

submissionsRouter.get(
  '/mine/:id',
  requireAuth,
  asyncHandler(submissionsController.getMySubmissionHandler),
);

submissionsRouter.patch(
  '/mine/:id',
  requireAuth,
  validateBody(updateSubmissionSchema),
  asyncHandler(submissionsController.updateDraftHandler),
);

submissionsRouter.post(
  '/mine/:id/submit',
  requireAuth,
  asyncHandler(submissionsController.submitHandler),
);

submissionsRouter.post(
  '/mine/:id/files',
  requireAuth,
  manuscriptUpload.single('file'),
  asyncHandler(submissionsController.uploadFileHandler),
);

submissionsRouter.post(
  '/mine/:id/revise',
  requireAuth,
  manuscriptUpload.single('file'),
  validateBody(submitRevisionSchema),
  asyncHandler(submissionsController.submitRevisionHandler),
);

// ─── Editor / Admin routes ────────────────────────────────────────────────────

submissionsRouter.get(
  '/',
  requireAuth,
  requireRole('EDITOR', 'ADMIN'),
  asyncHandler(submissionsController.listAllSubmissionsHandler),
);

submissionsRouter.get(
  '/:id',
  requireAuth,
  requireRole('EDITOR', 'ADMIN'),
  asyncHandler(submissionsController.getSubmissionForEditorHandler),
);
