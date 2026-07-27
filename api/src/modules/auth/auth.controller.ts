import type { Request, Response } from 'express';
import * as authService from './auth.service';

const REFRESH_COOKIE = 'dsj_refresh';
const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export async function registerHandler(req: Request, res: Response) {
  const user = await authService.register(req.body);
  res.status(201).json(user);
}

export async function loginHandler(req: Request, res: Response) {
  const { accessToken, refreshToken, user } = await authService.login(req.body);
  res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
  res.json({ accessToken, user });
}

export async function refreshHandler(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (!token) return res.status(401).json({ error: 'No refresh token' });

  const { accessToken, refreshToken } = await authService.refresh(token);
  res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
  res.json({ accessToken });
}

export async function logoutHandler(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  if (token) await authService.logout(token);
  res.clearCookie(REFRESH_COOKIE, { path: '/' });
  res.status(204).send();
}

export async function forgotPasswordHandler(req: Request, res: Response) {
  await authService.forgotPassword(req.body.email);
  res.json({ message: 'If that email is registered, a reset link has been sent.' });
}

export async function resetPasswordHandler(req: Request, res: Response) {
  await authService.resetPassword(req.body);
  res.json({ message: 'Password updated successfully.' });
}

export async function verifyEmailHandler(req: Request, res: Response) {
  await authService.verifyEmail(req.body);
  res.json({ message: 'Email verified successfully.' });
}

export async function acceptInvitationHandler(req: Request, res: Response) {
  const { accessToken, refreshToken, user } = await authService.acceptInvitation(req.body);
  res.cookie(REFRESH_COOKIE, refreshToken, COOKIE_OPTS);
  res.json({ accessToken, user });
}
