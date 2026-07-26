import type { Request, Response } from 'express';
import * as usersService from './users.service';

export async function getMeHandler(req: Request, res: Response) {
  const user = await usersService.getMe(req.user!.sub);
  res.json(user);
}

export async function getPublicProfileHandler(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const user = await usersService.getPublicProfile(id);
  res.json(user);
}

export async function updateMeHandler(req: Request, res: Response) {
  const user = await usersService.updateMe(req.user!.sub, req.body);
  res.json(user);
}

export async function uploadAvatarHandler(req: Request, res: Response) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  const user = await usersService.updateAvatar(req.user!.sub, avatarUrl);
  res.json(user);
}
