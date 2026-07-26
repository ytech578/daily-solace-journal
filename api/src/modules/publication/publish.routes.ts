import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { requireAuth, requireRole } from '../../middleware/auth';
import * as publicationService from './publication.service';
import { verifyWebhookSignature } from '../../services/payment.service';
import type { Request, Response } from 'express';

export const publishRouter = Router();

// ─── Volumes ──────────────────────────────────────────────────────────────────

publishRouter.get(
  '/journals/:journalId/volumes',
  asyncHandler(async (req, res) => {
    const { journalId } = req.params as { journalId: string };
    res.json(await publicationService.listVolumes(journalId));
  }),
);

publishRouter.post(
  '/journals/:journalId/volumes',
  requireAuth,
  requireRole('EDITOR', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { journalId } = req.params as { journalId: string };
    const { number, year } = req.body as { number: number; year: number };
    res.status(201).json(await publicationService.createVolume(journalId, number, year));
  }),
);

// ─── Issues ───────────────────────────────────────────────────────────────────

publishRouter.post(
  '/volumes/:volumeId/issues',
  requireAuth,
  requireRole('EDITOR', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { volumeId } = req.params as { volumeId: string };
    const { number, title } = req.body as { number: number; title?: string };
    res.status(201).json(await publicationService.createIssue(volumeId, number, title));
  }),
);

publishRouter.post(
  '/issues/:issueId/publish',
  requireAuth,
  requireRole('EDITOR', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { issueId } = req.params as { issueId: string };
    res.json(await publicationService.publishIssue(issueId));
  }),
);

publishRouter.get(
  '/journals/:journalId/current-issue',
  asyncHandler(async (req, res) => {
    const { journalId } = req.params as { journalId: string };
    res.json(await publicationService.getCurrentIssue(journalId));
  }),
);

// ─── Publish article ──────────────────────────────────────────────────────────

publishRouter.post(
  '/:id/publish',
  requireAuth,
  requireRole('EDITOR', 'ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const article = await publicationService.publishArticle(id, req.user!.sub, req.body);
    res.status(201).json(article);
  }),
);

// ─── APC Payment routes ───────────────────────────────────────────────────────

publishRouter.post(
  '/:id/create-payment',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const order = await publicationService.createApcOrder(id, req.user!.sub);
    res.status(201).json(order);
  }),
);

publishRouter.post(
  '/:id/verify-payment',
  requireAuth,
  asyncHandler(async (req, res) => {
    const payment = await publicationService.verifyAndConfirmPayment(req.body);
    res.json(payment);
  }),
);

// Razorpay webhook — must come BEFORE express.json() in the middleware chain
// (raw body is preserved via the scoped raw parser in app.ts)
publishRouter.post(
  '/payments/webhook',
  asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = req.body as Buffer;

    if (!verifyWebhookSignature(rawBody.toString(), signature)) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(rawBody.toString());
    if (event.event === 'payment.captured') {
      const notes = event.payload?.payment?.entity?.notes;
      if (notes?.submissionId) {
        // Payment was already verified client-side; webhook is the safety net
        console.log('Webhook: payment captured for submission', notes.submissionId);
      }
    }

    res.json({ received: true });
  }),
);
