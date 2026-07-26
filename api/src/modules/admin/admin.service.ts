import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import type { UpdateRoleInput } from './admin.schemas';

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