import type { Request, Response } from 'express';
import * as contactService from './contact.service';
import type { CreateContactMessageInput } from './contact.schemas';

export async function createContactMessageHandler(req: Request, res: Response) {
  const input = req.body as CreateContactMessageInput;
  const message = await contactService.createContactMessage(input);
  res.status(201).json(message);
}
