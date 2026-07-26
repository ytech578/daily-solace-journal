import type { Request, Response } from 'express';
import * as submissionsService from './submissions.service';
import { fileUrl } from '../../services/storage.service';
import type { FileType } from '@prisma/client';

export async function createDraftHandler(req: Request, res: Response) {
  const sub = await submissionsService.createDraft(req.user!.sub, req.body);
  res.status(201).json(sub);
}

export async function listMySubmissionsHandler(req: Request, res: Response) {
  const subs = await submissionsService.listMySubmissions(req.user!.sub);
  res.json(subs);
}

export async function getMySubmissionHandler(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const sub = await submissionsService.getSubmissionForAuthor(id, req.user!.sub);
  res.json(sub);
}

export async function updateDraftHandler(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const sub = await submissionsService.updateDraft(id, req.user!.sub, req.body);
  res.json(sub);
}

export async function submitHandler(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const sub = await submissionsService.submitSubmission(id, req.user!.sub);
  res.json(sub);
}

export async function uploadFileHandler(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const { type, version } = req.body as { type: FileType; version?: number };
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const file = await submissionsService.attachFile(id, {
    type,
    filename: req.file.originalname,
    storagePath: (req.file as any).location || req.file.path,
    mimeType: req.file.mimetype,
    sizeBytes: req.file.size,
    version: version ? Number(version) : 1,
  });
  const fileUrlStr = fileUrl((req.file as any).location || req.file.path);
  res.status(201).json({ ...file, url: fileUrlStr });
}

export async function submitRevisionHandler(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const fileUploaded = !!req.file;
  if (req.file) {
    await submissionsService.attachFile(id, {
      type: 'REVISED_MANUSCRIPT',
      filename: req.file.originalname,
      storagePath: (req.file as any).location || req.file.path,
      mimeType: req.file.mimetype,
      sizeBytes: req.file.size,
    });
  }
  await submissionsService.submitRevision(id, req.user!.sub, req.body, fileUploaded);
  res.json({ message: 'Revision submitted successfully' });
}

// ─── Editor handlers ──────────────────────────────────────────────────────────

export async function listAllSubmissionsHandler(req: Request, res: Response) {
  const { status, journalId, page } = req.query as Record<string, string | undefined>;
  const result = await submissionsService.listAllSubmissions({
    status,
    journalId,
    page: page ? Number(page) : 1,
  });
  res.json(result);
}

export async function getSubmissionForEditorHandler(req: Request, res: Response) {
  const { id } = req.params as { id: string };
  const sub = await submissionsService.getSubmissionForEditor(id);
  res.json(sub);
}
