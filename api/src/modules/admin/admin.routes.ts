import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { updateRoleSchema, inviteEditorSchema, createAdminSchema } from './admin.schemas';
import * as adminController from './admin.controller';

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole('ADMIN'));

adminRouter.get('/users', asyncHandler(adminController.listUsersHandler));
adminRouter.patch(
  '/users/:id/role',
  validateBody(updateRoleSchema),
  asyncHandler(adminController.updateUserRoleHandler),
);

adminRouter.delete('/users/:id', asyncHandler(adminController.deactivateUserHandler));
adminRouter.get('/stats', asyncHandler(adminController.getStatsHandler));
adminRouter.post('/editors', validateBody(inviteEditorSchema), asyncHandler(adminController.inviteEditorHandler));
adminRouter.post('/admins', validateBody(createAdminSchema), asyncHandler(adminController.createAdminHandler));