import { prisma } from '../../lib/prisma';
import type { CreateContactMessageInput } from './contact.schemas';

export async function createContactMessage(input: CreateContactMessageInput) {
  return prisma.contactMessage.create({
    data: {
      name: input.name,
      email: input.email,
      subject: input.subject,
      message: input.message,
    },
  });
}
