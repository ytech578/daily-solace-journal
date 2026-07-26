import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { requireAuth } from '../../middleware/auth';
import { validateBody } from '../../middleware/validate';
import { updateProfileSchema } from './users.schemas';
import { avatarUpload } from '../../services/storage.service';
import * as usersController from './users.controller';

export const usersRouter = Router();

// Authenticated — own profile
usersRouter.get('/me', requireAuth, asyncHandler(usersController.getMeHandler));
usersRouter.patch('/me', requireAuth, validateBody(updateProfileSchema), asyncHandler(usersController.updateMeHandler));
usersRouter.post('/me/avatar', requireAuth, avatarUpload.single('avatar'), asyncHandler(usersController.uploadAvatarHandler));

// Public — anyone can view a user's public profile
usersRouter.get('/:id', asyncHandler(usersController.getPublicProfileHandler));
