import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import type { UpdateProfileInput } from './users.schemas';

const PUBLIC_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  bio: true,
  institution: true,
  country: true,
  profileImageUrl: true,
  orcid: true,
  createdAt: true,
} as const;

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: PUBLIC_SELECT });
  if (!user) throw new AppError(404, 'User not found');
  return user;
}

export async function getPublicProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId, isActive: true },
    select: { id: true, name: true, bio: true, institution: true, country: true, profileImageUrl: true, orcid: true },
  });
  if (!user) throw new AppError(404, 'User not found');

  const articles = await prisma.article.findMany({
    where: {
      publishedAt: { not: null },
      OR: [
        { submission: { authorId: userId } },
        { submission: { coAuthors: { some: { userId } } } },
      ],
    },
    select: {
      id: true,
      doi: true,
      viewCount: true,
      downloadCount: true,
      publishedAt: true,
      pageStart: true,
      pageEnd: true,
      issue: { select: { number: true, volume: { select: { number: true, year: true } } } },
      submission: {
        select: {
          title: true,
          author: { select: { name: true } },
          coAuthors: { select: { name: true }, orderBy: { order: 'asc' as const } },
          journal: { select: { name: true } },
        },
      },
    },
    orderBy: { publishedAt: 'desc' },
  });

  return { ...user, articles };
}

export async function updateMe(userId: string, input: UpdateProfileInput) {
  return prisma.user.update({
    where: { id: userId },
    data: input,
    select: PUBLIC_SELECT,
  });
}

export async function updateAvatar(userId: string, avatarUrl: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { profileImageUrl: avatarUrl },
    select: { id: true, profileImageUrl: true },
  });
}
