import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { prisma } from '../../lib/prisma';

export const searchRouter = Router();

// GET /api/search?q=&subjectId=&journalId=&year=&page=
searchRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { q = '', subjectId, journalId, year, page = '1' } = req.query as Record<string, string>;
    const take = 20;
    const skip = (Number(page) - 1) * take;

    // Build Prisma full-text search on title + abstract via submission
    const submissionWhere = {
      ...(q ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { abstract: { contains: q, mode: 'insensitive' as const } },
          { keywords: { has: q } },
        ],
      } : {}),
      ...(journalId ? { journalId } : {}),
    };

    const articleWhere = {
      publishedAt: { not: null },
      ...(subjectId ? { subjectId } : {}),
      ...(year ? { issue: { volume: { year: Number(year) } } } : {}),
      submission: submissionWhere,
    };

    const [items, total] = await prisma.$transaction([
      prisma.article.findMany({
        where: articleWhere,
        select: {
          id: true,
          doi: true,
          publishedAt: true,
          viewCount: true,
          downloadCount: true,
          subject: { select: { name: true, slug: true } },
          issue: {
            select: {
              number: true,
              volume: { select: { number: true, year: true } },
            },
          },
          submission: {
            select: {
              title: true,
              abstract: true,
              keywords: true,
              author: { select: { name: true, institution: true } },
              journal: { select: { id: true, name: true, slug: true } },
            },
          },
        },
        orderBy: { publishedAt: 'desc' },
        take,
        skip,
      }),
      prisma.article.count({ where: articleWhere }),
    ]);

    res.json({ items, total, page: Number(page), pageCount: Math.ceil(total / take), query: q });
  }),
);
