import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { validateBody } from '../../middleware/validate';
import {
  registerExtendedSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  acceptInvitationSchema
} from './auth.schemas';
import * as authController from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerExtendedSchema), asyncHandler(authController.registerHandler));
authRouter.post('/login', validateBody(loginSchema), asyncHandler(authController.loginHandler));
authRouter.post('/refresh', asyncHandler(authController.refreshHandler));
authRouter.post('/logout', asyncHandler(authController.logoutHandler));
authRouter.post('/forgot-password', validateBody(forgotPasswordSchema), asyncHandler(authController.forgotPasswordHandler));
authRouter.post('/reset-password', validateBody(resetPasswordSchema), asyncHandler(authController.resetPasswordHandler));
authRouter.post('/verify-email', validateBody(verifyEmailSchema), asyncHandler(authController.verifyEmailHandler));
authRouter.post('/accept-invitation', validateBody(acceptInvitationSchema), asyncHandler(authController.acceptInvitationHandler));
