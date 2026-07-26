import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { validateBody } from '../../middleware/validate';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schemas';
import * as authController from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), asyncHandler(authController.registerHandler));
authRouter.post('/login', validateBody(loginSchema), asyncHandler(authController.loginHandler));
authRouter.post('/refresh', asyncHandler(authController.refreshHandler));
authRouter.post('/logout', asyncHandler(authController.logoutHandler));
authRouter.post('/forgot-password', validateBody(forgotPasswordSchema), asyncHandler(authController.forgotPasswordHandler));
authRouter.post('/reset-password', validateBody(resetPasswordSchema), asyncHandler(authController.resetPasswordHandler));
