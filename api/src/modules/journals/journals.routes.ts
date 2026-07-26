import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { requireAuth, requireRole } from '../../middleware/auth';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';

export const journalsRouter = Router();

// Public: list all active indexed journals
journalsRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const journals = await prisma.journal.findMany({
      where: { isActive: true, isIndexed: true },
      select: {
        id: true, name: true, slug: true, issn: true, eissn: true,
        description: true, coverImageUrl: true,
        subjects: { include: { subject: { select: { name: true, slug: true } } } },
        _count: { select: { submissions: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json(journals);
  }),
);

// Public: get single journal by slug
journalsRouter.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const { slug } = req.params as { slug: string };
    const journal = await prisma.journal.findUnique({
      where: { slug },
      include: {
        subjects: { include: { subject: true } },
        boardMembers: { orderBy: { order: 'asc' } },
        _count: { select: { submissions: true, volumes: true } },
      },
    });
    if (!journal || !journal.isActive) throw new AppError(404, 'Journal not found');
    res.json(journal);
  }),
);

// Admin: create journal
journalsRouter.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const journal = await prisma.journal.create({ data: req.body });
    res.status(201).json(journal);
  }),
);

// Admin: update journal
journalsRouter.patch(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const journal = await prisma.journal.update({ where: { id }, data: req.body });
    res.json(journal);
  }),
);

// Public: list subjects
journalsRouter.get(
  '/:id/editorial-board',
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const members = await prisma.editorialBoardMember.findMany({
      where: { journalId: id },
      orderBy: { order: 'asc' },
    });
    res.json(members);
  }),
);
