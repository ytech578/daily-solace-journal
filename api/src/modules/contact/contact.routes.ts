import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { validateBody } from '../../middleware/validate';
import { createContactMessageSchema } from './contact.schemas';
import * as contactController from './contact.controller';

export const contactRouter = Router();

contactRouter.post(
  '/',
  validateBody(createContactMessageSchema),
  asyncHandler(contactController.createContactMessageHandler)
);
