import { Router } from 'express';
import { asyncHandler } from '../../lib/asyncHandler';
import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import fs from 'fs';
import path from 'path';

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
    const { journalId, subjectId, subjectSlug, page = '1', limit = '20' } = req.query as Record<string, string>;
    const take = Math.min(Number(limit), 50);
    const skip = (Number(page) - 1) * take;

    // Resolve subjectSlug to subjectId if provided
    let resolvedSubjectId = subjectId;
    if (!resolvedSubjectId && subjectSlug) {
      const subject = await prisma.subject.findUnique({ where: { slug: subjectSlug }, select: { id: true } });
      if (subject) resolvedSubjectId = subject.id;
    }

    const where = {
      publishedAt: { not: null },
      ...(journalId ? { submission: { journalId } } : {}),
      ...(resolvedSubjectId ? { subjectId: resolvedSubjectId } : {}),
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

// Helper: generate a real PDF from article data using PDFKit
async function generateArticlePdf(article: {
  id: string;
  doi: string | null;
  publishedAt: Date | null;
  pageStart: number | null;
  pageEnd: number | null;
  submission: {
    title: string;
    abstract: string;
    keywords: string[];
    author: { name: string; institution: string | null };
    coAuthors: { name: string; institution: string | null }[];
    journal: { name: string } | null;
  };
}): Promise<Buffer> {
  const PDFDocument = (await import('pdfkit')).default;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 72, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const sub = article.submission;
    const allAuthors = [
      sub.author,
      ...sub.coAuthors.filter((c) => c.name !== sub.author.name),
    ];
    const year = article.publishedAt ? new Date(article.publishedAt).getFullYear() : '';
    const publishedDate = article.publishedAt
      ? new Date(article.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
      : '';

    const pageWidth = doc.page.width - 144;

    // ── Header bar ──────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 8).fill('#C8972A');
    doc.moveDown(0.3);

    // Journal name
    doc.fillColor('#0B1D51').fontSize(10).font('Helvetica')
      .text(sub.journal?.name ?? 'Daily Solace Journal', { align: 'center' });
    doc.moveDown(0.2);

    // ── Title ───────────────────────────────────────────────────────────────
    doc.fillColor('#070f2b').fontSize(18).font('Helvetica-Bold')
      .text(sub.title, { align: 'center', lineGap: 4 });
    doc.moveDown(0.6);

    // ── Authors ─────────────────────────────────────────────────────────────
    doc.fillColor('#333333').fontSize(10).font('Helvetica')
      .text(allAuthors.map((a) => a.name).join(', '), { align: 'center' });

    const institutions = [...new Set(allAuthors.map((a) => a.institution).filter(Boolean))];
    if (institutions.length > 0) {
      doc.moveDown(0.2);
      doc.fillColor('#666666').fontSize(9).font('Helvetica-Oblique')
        .text(institutions.join(' · '), { align: 'center' });
    }
    doc.moveDown(0.5);

    // ── Meta bar ────────────────────────────────────────────────────────────
    const metaParts: string[] = [];
    if (publishedDate) metaParts.push(`Published: ${publishedDate}`);
    if (article.doi) metaParts.push(`DOI: ${article.doi}`);
    if (article.pageStart) metaParts.push(`Pages: ${article.pageStart}–${article.pageEnd}`);

    if (metaParts.length > 0) {
      doc.fillColor('#888888').fontSize(8.5).font('Helvetica')
        .text(metaParts.join('   |   '), { align: 'center' });
      doc.moveDown(0.5);
    }

    // Divider
    doc.moveTo(72, doc.y).lineTo(doc.page.width - 72, doc.y).strokeColor('#C8972A').lineWidth(1.5).stroke();
    doc.moveDown(0.8);

    // ── Abstract ────────────────────────────────────────────────────────────
    doc.fillColor('#0B1D51').fontSize(12).font('Helvetica-Bold').text('Abstract');
    doc.moveDown(0.3);

    const sectionPattern = /\b(Objective|Background|Methods|Results|Conclusion|Introduction|Discussion):/gi;
    const abstractText = sub.abstract;

    if (sectionPattern.test(abstractText)) {
      const parts = abstractText.split(/(?=\b(?:Objective|Background|Methods|Results|Conclusion|Introduction|Discussion):)/i);
      parts.forEach((part) => {
        const match = part.match(/^(\w+):(.*)/s);
        if (match) {
          doc.fillColor('#0B1D51').fontSize(10).font('Helvetica-Bold').text(match[1] + ':', { continued: true });
          doc.fillColor('#333333').fontSize(10).font('Helvetica').text(' ' + match[2].trim(), { lineGap: 3 });
          doc.moveDown(0.3);
        } else {
          doc.fillColor('#333333').fontSize(10).font('Helvetica').text(part.trim(), { lineGap: 3 });
        }
      });
    } else {
      doc.fillColor('#333333').fontSize(10).font('Helvetica')
        .text(abstractText, { lineGap: 3, align: 'justify', width: pageWidth });
    }

    doc.moveDown(0.8);

    // ── Keywords ────────────────────────────────────────────────────────────
    if (sub.keywords && sub.keywords.length > 0) {
      doc.fillColor('#0B1D51').fontSize(10).font('Helvetica-Bold').text('Keywords: ', { continued: true });
      doc.fillColor('#555555').fontSize(10).font('Helvetica-Oblique')
        .text(sub.keywords.join(', '), { lineGap: 2 });
      doc.moveDown(0.8);
    }

    // ── Open Access notice ──────────────────────────────────────────────────
    doc.moveTo(72, doc.y).lineTo(doc.page.width - 72, doc.y).strokeColor('#e2e8f0').lineWidth(1).stroke();
    doc.moveDown(0.6);

    doc.fillColor('#888888').fontSize(8).font('Helvetica')
      .text(
        `© ${year} ${sub.journal?.name ?? 'Daily Solace Journal'}. This is an open-access article distributed under the terms of the Creative Commons Attribution 4.0 International License (CC BY 4.0).`,
        { align: 'center', lineGap: 2 }
      );

    // ── Footer ──────────────────────────────────────────────────────────────
    const bottomY = doc.page.height - 40;
    doc.rect(0, bottomY - 8, doc.page.width, 8).fill('#0B1D51');
    doc.fillColor('#aaaaaa').fontSize(8).font('Helvetica')
      .text(
        `Daily Solace Journal  ·  ${sub.journal?.name ?? ''}  ·  Page 1 of 1`,
        72, bottomY + 2,
        { align: 'center', width: pageWidth }
      );

    doc.end();
  });
}

// Public: download PDF (generates real PDF from article data; serves uploaded file if present)
articlesRouter.get(
  '/:id/download',
  asyncHandler(async (req, res) => {
    const { id } = req.params as { id: string };
    const article = await prisma.article.findUnique({
      where: { id },
      select: {
        id: true,
        doi: true,
        pdfUrl: true,
        publishedAt: true,
        pageStart: true,
        pageEnd: true,
        submission: {
          select: {
            title: true,
            abstract: true,
            keywords: true,
            author: { select: { name: true, institution: true } },
            coAuthors: { orderBy: { order: 'asc' as const }, select: { name: true, institution: true } },
            journal: { select: { name: true } },
            files: { where: { type: 'MANUSCRIPT' }, orderBy: { version: 'desc' }, take: 1 },
          },
        },
      },
    });

    if (!article) throw new AppError(404, 'Article not found');

    const file = article.submission.files[0];

    // 1. Serve uploaded file if it exists on disk
    if (file && !file.storagePath.startsWith('http')) {
      if (fs.existsSync(file.storagePath)) {
        prisma.article.update({ where: { id }, data: { downloadCount: { increment: 1 } } }).catch(() => {});
        const sanitizedTitle = article.submission.title.replace(/[^a-z0-9]/gi, '_').slice(0, 60);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${sanitizedTitle}.pdf"`);
        return res.sendFile(path.resolve(file.storagePath));
      }
    }

    // 2. Redirect to external file URL
    if (file && (file.storagePath.startsWith('http://') || file.storagePath.startsWith('https://'))) {
      prisma.article.update({ where: { id }, data: { downloadCount: { increment: 1 } } }).catch(() => {});
      return res.redirect(file.storagePath);
    }

    // 3. Check pdfUrl field for a file on disk
    if (article.pdfUrl) {
      const filePath = path.join(process.cwd(), article.pdfUrl);
      if (fs.existsSync(filePath)) {
        prisma.article.update({ where: { id }, data: { downloadCount: { increment: 1 } } }).catch(() => {});
        const sanitizedTitle = article.submission.title.replace(/[^a-z0-9]/gi, '_').slice(0, 60);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${sanitizedTitle}.pdf"`);
        return res.sendFile(path.resolve(filePath));
      }
    }

    // 4. No file anywhere — generate a real PDF on-the-fly from article data using PDFKit
    prisma.article.update({ where: { id }, data: { downloadCount: { increment: 1 } } }).catch(() => {});
    const pdfBuffer = await generateArticlePdf(article as any);
    const sanitizedTitle = article.submission.title.replace(/[^a-z0-9]/gi, '_').slice(0, 60);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${sanitizedTitle}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    return res.send(pdfBuffer);
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

