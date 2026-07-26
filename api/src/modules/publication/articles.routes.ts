import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import fs from 'fs';

export const articlesRouter = Router();

const ARTICLE_LIST_SELECT = {
  id: true,
  doi: true,
  pageStart: true,
  pageEnd: true,
  viewCount: true,
  downloadCount: true,
  publishedAt: true,
  issue: {
    select: {
      number: true,
      publicationDate: true,
      volume: { select: { number: true, year: true } },
    },
  },
  subject: { select: { name: true, slug: true } },
  submission: {
    select: {
      title: true,
      abstract: true,
      keywords: true,
      author: { select: { id: true, name: true, institution: true } },
      coAuthors: { orderBy: { order: 'asc' as const } },
      journal: { select: { id: true, name: true, slug: true } },
    },
  },
} as const;

// Public: list published articles (paginated)
articlesRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const { journalId, subjectId, page = '1', limit = '20' } = req.query as Record<string, string>;
    const take = Math.min(Number(limit), 50);
    const skip = (Number(page) - 1) * take;

    const where = {
      publishedAt: { not: null },
      ...(journalId ? { submission: { journalId } } : {}),
      ...(subjectId ? { subjectId } : {}),
    };

    const [items, total] = await prisma.$transaction([
      prisma.article.findMany({ where, select: ARTICLE_LIST_SELECT, orderBy: { publishedAt: 'desc' }, take, skip }),
      prisma.article.count({ where }),
    ]);

    res.json({ items, total, page: Number(page), pageCount: Math.ceil(total / take) });
  }),
);

// Public: get article detail + increment view count
articlesRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const article = await prisma.article.findUnique({
      where: { id },
      select: ARTICLE_LIST_SELECT,
    });
    if (!article) throw new AppError(404, 'Article not found');

    // Increment view count asynchronously
    prisma.article.update({ where: { id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

    res.json(article);
  }),
);

// Public: download PDF (serves manuscript file + increments download count)
articlesRouter.get(
  '/:id/download',
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        submission: {
          select: {
            title: true,
            files: { where: { type: 'MANUSCRIPT' }, orderBy: { version: 'desc' }, take: 1 },
          },
        },
      },
    });

    if (!article) throw new AppError(404, 'Article not found');
    const file = article.submission.files[0];

    const sendDummyPdf = (filename: string) => {
      // Valid minimal PDF base64 string
      const dummyPdfBuffer = Buffer.from(
        'JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLY31jBUMlXQMVYAsQxOugqL0/LwSlczElFQlHQVjHSNjBSsDBQMUQwwdAAqICjQKZW5kc3RyZWFtCmVuZG9iagoKCjMgMCBvYmoKNjAKZW5kb2JqCgo0IDAgb2JqCjw8L1R5cGUvUGFnZS9NZWRpYUJveFswIDAgNTk1IDg0Ml0vUmVzb3VyY2VzPDwvRm9udDw8L0YxIDUgMCBSPj4+Pi9Db250ZW50cyAyIDAgUi9QYXJlbnQgNiAwIFI+PgplbmRvYmoKCjUgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4KZW5kb2JqCgo2IDAgb2JqCjw8L1R5cGUvUGFnZXMvQ291bnQgMS9LaWRzWzQgMCBSXT4+CmVuZG9iagoKNyAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgNiAwIFI+PgplbmRvYmoKCjEgMCBvYmoKPDwvQ3JlYXRvciA8ZmVmZjAwNTcwMDcyMDBlMTAwNzQwMDY1MDA3MjAwMjAwMDUwMDA0NDAwNDYwMDIwMDA0MTAwNTAwMDRkPgovUHJvZHVjZXIgPGZlZmYwMDU3MDA3MjAwZTEwMDc0MDA2NTAwNzIwMDIwMDA1MDAwNDQwMDQ2MDAyMDAwNDEwMDUwMDA0ZD4KL0NyZWF0aW9uRGF0ZSAoRDoyMDIyMDEwMTExMTAwM1opCj4+CmVuZG9iagoKeHJlZgowIDgKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwNTEwIDAwMDAwIG4gCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDE0NiAwMDAwMCBuIAowMDAwMDAwMTY1IDAwMDAwIG4gCjAwMDAwMDAyNzEgMDAwMDAgbiAKMDAwMDAwMDM1OSAwMDAwMCBuIAowMDAwMDAwNDE2IDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA4L1Jvb3QgNyAwIFIvSW5mbyAxIDAgUj4+CnN0YXJ0eHJlZgo2NDEKJSVFT0YK',
        'base64'
      );
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      return res.send(dummyPdfBuffer);
    };

    if (!file) {
      return sendDummyPdf('placeholder-manuscript.pdf');
    }

    if (file.storagePath.startsWith('http://') || file.storagePath.startsWith('https://')) {
      prisma.article.update({ where: { id }, data: { downloadCount: { increment: 1 } } }).catch(() => {});
      return res.redirect(file.storagePath);
    }

    if (!fs.existsSync(file.storagePath)) {
      // To prevent inline PDF viewer from breaking on seeded data without actual files, serve a dummy PDF
      return sendDummyPdf('placeholder-manuscript.pdf');
    }

    prisma.article.update({ where: { id }, data: { downloadCount: { increment: 1 } } }).catch(() => {});

    const sanitizedTitle = article.submission.title.replace(/[^a-z0-9]/gi, '_').slice(0, 60);
    res.download(file.storagePath, `${sanitizedTitle}.pdf`);
  }),
);

// Public: DOI redirect
articlesRouter.get(
  '/doi/:prefix/:suffix',
  asyncHandler(async (req, res) => {
    const doi = `${req.params.prefix}/${req.params.suffix}`;
    const article = await prisma.article.findUnique({ where: { doi }, select: { id: true } });
    if (!article) throw new AppError(404, 'DOI not found');
    res.redirect(301, `/articles/${article.id}`);
  }),
);
