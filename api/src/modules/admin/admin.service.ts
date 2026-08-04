import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { emailService } from '../../services/email.service';
import { env } from '../../config/env';
import type { UpdateRoleInput, InviteEditorInput, CreateAdminInput } from './admin.schemas';

// Deliberately thin, matching the v1 scope cut: no user editing, no
// deactivation, no pagination. Just enough to stop needing Prisma Studio
// for the one thing you'll do repeatedly while testing — turning an
// AUTHOR into a REVIEWER or EDITOR.

export async function listUsers() {
  return prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateUserRole(userId: string, input: UpdateRoleInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'User not found');

  return prisma.user.update({
    where: { id: userId },
    data: { role: input.role },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function deactivateUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'User not found');

  return prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
    select: { id: true, name: true, email: true, isActive: true },
  });
}

export async function getStats() {
  const [totalUsers, totalSubmissions, publishedArticles, revenue] = await Promise.all([
    prisma.user.count(),
    prisma.submission.count(),
    prisma.article.count({ where: { publishedAt: { not: null } } }),
    prisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    }),
  ]);

  return {
    totalUsers,
    totalSubmissions,
    publishedArticles,
    revenue: (revenue._sum.amount || 0) / 100, // convert paise to INR
  };
}

export async function inviteEditor(input: InviteEditorInput) {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });

  if (existingUser) {
    if (existingUser.role === 'EDITOR' || existingUser.role === 'ADMIN') {
      throw new AppError(400, 'User is already an Editor or Admin');
    }
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { role: 'EDITOR' },
    });
    return { success: true, message: 'Existing user promoted to Editor' };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.userInvitation.create({
    data: {
      email: input.email,
      role: 'EDITOR',
      token,
      expiresAt,
    },
  });

  const name = input.email.split('@')[0];
  await emailService.sendInvitation({
    to: input.email,
    name,
    role: 'Editor',
    inviteUrl: `${env.CORS_ORIGIN}/auth/accept-invitation?token=${token}`,
  });

  return { success: true, message: 'Invitation sent' };
}

export async function createAdmin(input: CreateAdminInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: {
      email: input.email,
      name: input.name,
      firstName: input.name,
      lastName: '',
      passwordHash,
      role: 'ADMIN',
      emailVerified: true,
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return user;
}

export async function listContactMessages() {
  return prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function markContactMessageRead(id: string, isRead: boolean) {
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) throw new AppError(404, 'Message not found');

  return prisma.contactMessage.update({
    where: { id },
    data: { isRead },
  });
}

export async function deleteContactMessage(id: string) {
  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) throw new AppError(404, 'Message not found');

  return prisma.contactMessage.delete({
    where: { id },
  });
}