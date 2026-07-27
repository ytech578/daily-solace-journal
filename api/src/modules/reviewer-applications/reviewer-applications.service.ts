import crypto from 'crypto';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { emailService } from '../../services/email.service';
import { env } from '../../config/env';
import type { CreateApplicationInput, UpdateApplicationStatusInput } from './reviewer-applications.schemas';

export async function createApplication(input: CreateApplicationInput, userId?: string) {
  // Check if an application already exists for this email
  const existing = await prisma.reviewerApplication.findFirst({
    where: { email: input.email },
  });

  if (existing && existing.status === 'PENDING') {
    throw new AppError(409, 'You already have a pending reviewer application');
  }

  const application = await prisma.reviewerApplication.create({
    data: {
      ...input,
      userId, // Link to existing user if they are logged in
    },
  });

  return application;
}

export async function listApplications() {
  return prisma.reviewerApplication.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateApplicationStatus(id: string, input: UpdateApplicationStatusInput) {
  const application = await prisma.reviewerApplication.findUnique({
    where: { id },
  });

  if (!application) {
    throw new AppError(404, 'Reviewer application not found');
  }

  if (application.status !== 'PENDING') {
    throw new AppError(400, 'Application is already processed');
  }

  // Transaction to update application and potentially send invitation
  await prisma.$transaction(async (tx) => {
    await tx.reviewerApplication.update({
      where: { id },
      data: {
        status: input.status,
        adminNote: input.adminNote,
      },
    });

    if (input.status === 'APPROVED') {
      const existingUser = await tx.user.findUnique({ where: { email: application.email } });

      if (existingUser) {
        // If user exists, just upgrade their role directly
        await tx.user.update({
          where: { id: existingUser.id },
          data: { role: 'REVIEWER' },
        });
      } else {
        // If no user exists, create an invitation
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await tx.userInvitation.create({
          data: {
            email: application.email,
            role: 'REVIEWER',
            token,
            expiresAt,
          },
        });

        // Send invitation email
        await emailService.sendInvitation({
          to: application.email,
          name: `${application.firstName} ${application.lastName}`,
          role: 'Reviewer',
          inviteUrl: `${env.CORS_ORIGIN}/auth/accept-invitation?token=${token}`,
        });
      }
    }

    // Always send status email
    await emailService.sendReviewerApplicationStatus({
      to: application.email,
      name: `${application.firstName} ${application.lastName}`,
      approved: input.status === 'APPROVED',
    });
  });

  return { success: true };
}
