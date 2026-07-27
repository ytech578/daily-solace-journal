import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { emailService } from '../../services/email.service';
import type { RegisterExtendedInput, LoginInput, ResetPasswordInput, AcceptInvitationInput, VerifyEmailInput } from './auth.schemas';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

// ─── Token helpers ────────────────────────────────────────────────────────────

function signAccess(userId: string, role: string) {
  return jwt.sign({ sub: userId, role }, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
}

async function createRefreshToken(userId: string) {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
  return token;
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function register(input: RegisterExtendedInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const { password, confirmPassword, ...rest } = input;
  const emailVerifyToken = crypto.randomBytes(32).toString('hex');

  const user = await prisma.user.create({
    data: { 
      ...rest, 
      passwordHash, 
      name: `${input.firstName} ${input.lastName}`,
      emailVerifyToken
    },
    select: { id: true, name: true, email: true, role: true },
  });

  await emailService.sendEmailVerification({ 
    to: input.email, 
    name: user.name,
    verifyUrl: `${env.CORS_ORIGIN}/auth/verify-email?token=${emailVerifyToken}`
  });
  
  return user;
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.isActive) throw new AppError(401, 'Invalid credentials');

  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new AppError(401, 'Invalid credentials');

  const accessToken = signAccess(user.id, user.role);
  const refreshToken = await createRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function refresh(rawToken: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: rawToken },
    include: { user: true },
  });

  if (!stored || stored.expiresAt < new Date()) {
    // Delete stale token if it exists
    if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } });
    throw new AppError(401, 'Invalid or expired refresh token');
  }

  // Rotate: delete old, issue new
  await prisma.refreshToken.delete({ where: { id: stored.id } });
  const accessToken = signAccess(stored.user.id, stored.user.role);
  const refreshToken = await createRefreshToken(stored.user.id);

  return { accessToken, refreshToken };
}

export async function logout(rawToken: string) {
  await prisma.refreshToken.deleteMany({ where: { token: rawToken } });
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Always respond 200 — don't reveal whether the email exists
  if (!user) return;

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);
  await prisma.passwordResetToken.create({ data: { token, userId: user.id, expiresAt } });

  await emailService.sendPasswordReset({
    to: email,
    name: user.name,
    resetUrl: `${env.CORS_ORIGIN}/reset-password/${token}`,
  });
}

export async function resetPassword(input: ResetPasswordInput) {
  const record = await prisma.passwordResetToken.findUnique({ where: { token: input.token } });

  if (!record || record.used || record.expiresAt < new Date()) {
    throw new AppError(400, 'Invalid or expired reset token');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
    // Invalidate all refresh tokens on password change
    prisma.refreshToken.deleteMany({ where: { userId: record.userId } }),
  ]);
}

export async function verifyEmail(input: VerifyEmailInput) {
  const user = await prisma.user.findUnique({ where: { emailVerifyToken: input.token } });
  if (!user) throw new AppError(400, 'Invalid or expired verification token');

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyToken: null },
  });
}

export async function acceptInvitation(input: AcceptInvitationInput) {
  const invite = await prisma.userInvitation.findUnique({ where: { token: input.token } });
  if (!invite || invite.used || invite.expiresAt < new Date()) {
    throw new AppError(400, 'Invalid or expired invitation token');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const existingUser = await prisma.user.findUnique({ where: { email: invite.email } });
  let user;

  if (existingUser) {
    user = await prisma.user.update({
      where: { id: existingUser.id },
      data: { role: invite.role, passwordHash }
    });
  } else {
    // Default name from email until they edit profile
    const nameStr = invite.email.split('@')[0];
    user = await prisma.user.create({
      data: { 
        email: invite.email,
        name: nameStr,
        firstName: nameStr,
        lastName: '',
        role: invite.role,
        passwordHash,
        emailVerified: true
      }
    });
  }

  await prisma.userInvitation.update({
    where: { id: invite.id },
    data: { used: true }
  });

  const accessToken = signAccess(user.id, user.role);
  const refreshToken = await createRefreshToken(user.id);
  
  return { accessToken, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}
