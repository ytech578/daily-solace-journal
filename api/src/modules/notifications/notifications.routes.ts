import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { requireAuth } from '../../middleware/auth';
import { notificationsService } from './notifications.service';

export const notificationsRouter = Router();

notificationsRouter.get('/', requireAuth, asyncHandler(async (req, res) => {
  const items = await notificationsService.listForUser(req.user!.sub);
  const unread = await notificationsService.unreadCount(req.user!.sub);
  res.json({ items, unread });
}));

notificationsRouter.patch('/:id/read', requireAuth, asyncHandler(async (req, res) => {
  const { id } = req.params as { id: string };
  await notificationsService.markRead(id, req.user!.sub);
  res.status(204).send();
}));

notificationsRouter.patch('/read-all', requireAuth, asyncHandler(async (req, res) => {
  await notificationsService.markAllRead(req.user!.sub);
  res.status(204).send();
}));
