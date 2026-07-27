import type { Request, Response } from 'express';
import * as applicationService from './reviewer-applications.service';
import { AppError } from '../../middleware/errorHandler';

export async function createApplicationHandler(req: Request, res: Response) {
  // Pass user id if they are logged in
  const userId = req.user?.sub;
  const application = await applicationService.createApplication(req.body, userId);
  res.status(201).json(application);
}

export async function listApplicationsHandler(req: Request, res: Response) {
  const applications = await applicationService.listApplications();
  res.json(applications);
}

export async function updateApplicationStatusHandler(req: Request, res: Response) {
  const { id } = req.params;
  const result = await applicationService.updateApplicationStatus(id as string, req.body);
  res.json(result);
}
