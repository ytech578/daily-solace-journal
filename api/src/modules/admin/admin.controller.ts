import type { Request, Response } from 'express';
import * as adminService from './admin.service';

export async function listUsersHandler(_req: Request, res: Response) {
  const users = await adminService.listUsers();
  res.status(200).json(users);
}

export async function updateUserRoleHandler(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const user = await adminService.updateUserRole(id, req.body);
  res.status(200).json(user);
}

export async function deactivateUserHandler(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const user = await adminService.deactivateUser(id);
  res.status(200).json(user);
}

export async function getStatsHandler(_req: Request, res: Response) {
  const stats = await adminService.getStats();
  res.status(200).json(stats);
}

export async function inviteEditorHandler(req: Request, res: Response) {
  const result = await adminService.inviteEditor(req.body);
  res.status(200).json(result);
}

export async function createAdminHandler(req: Request, res: Response) {
  const user = await adminService.createAdmin(req.body);
  res.status(201).json(user);
}

export async function listContactMessagesHandler(req: Request, res: Response) {
  const messages = await adminService.listContactMessages();
  res.status(200).json(messages);
}

export async function markContactMessageReadHandler(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const message = await adminService.markContactMessageRead(id, req.body.isRead);
  res.status(200).json(message);
}

export async function deleteContactMessageHandler(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  await adminService.deleteContactMessage(id);
  res.status(204).send();
}