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