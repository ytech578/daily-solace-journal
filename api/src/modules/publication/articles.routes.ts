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
      fullText: true,
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
    fullText?: string | null;
    keywords: string[];
    author: { name: string; institution: string | null };
    coAuthors: { name: string; institution: string | null }[];
    journal: { name: string } | null;
  };
}): Promise<Buffer> {
  const PDFDocument = (await import('pdfkit')).default;

  return new Promise((resolve, reject) => {
    try {
      const sub   = article.submission;
      const jName = sub.journal?.name ?? 'Daily Solace Journal';
      const year  = article.publishedAt ? new Date(article.publishedAt).getFullYear() : new Date().getFullYear();
      const publishedDate = article.publishedAt
        ? new Date(article.publishedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
        : '';

      const allAuthors = [
        sub.author,
        ...sub.coAuthors.filter((c) => c.name !== sub.author.name),
      ];

      // bufferPages:true lets us do a second pass (switchToPage) to stamp footers
      const doc = new PDFDocument({ margin: 72, size: 'A4', bufferPages: true });
      const chunks: Buffer[] = [];

      doc.on('data',  (chunk: Buffer) => chunks.push(chunk));
      doc.on('end',   () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: Error) => reject(err));

      const PW   = doc.page.width;   // 595.28
      const PH   = doc.page.height;  // 841.89
      const LMAR = 72;
      const cW   = PW - 2 * LMAR;

      // ──────────────────────────────────────────────────────────────────────
      // FIRST PASS: write all article content (PDFKit auto-adds pages as needed)
      // ──────────────────────────────────────────────────────────────────────

      // Gold top strip on page 1
      doc.rect(0, 0, PW, 6).fill('#C8972A');

      // Position cursor below the strip
      doc.y = 14;

      // Journal name
      doc.fillColor('#0B1D51').fontSize(10).font('Helvetica')
        .text(jName, LMAR, doc.y, { align: 'center', width: cW });
      doc.moveDown(0.5);

      // Title
      doc.fillColor('#070f2b').fontSize(16).font('Helvetica-Bold')
        .text(sub.title, LMAR, doc.y, { align: 'center', width: cW, lineGap: 4 });
      doc.moveDown(0.7);

      // Authors
      doc.fillColor('#333333').fontSize(10).font('Helvetica')
        .text(allAuthors.map((a) => a.name).join(', '), LMAR, doc.y, { align: 'center', width: cW });

      const insts = [...new Set(allAuthors.map((a) => a.institution).filter(Boolean))];
      if (insts.length > 0) {
        doc.moveDown(0.25);
        doc.fillColor('#666666').fontSize(9).font('Helvetica-Oblique')
          .text(insts.join(' · '), LMAR, doc.y, { align: 'center', width: cW });
      }
      doc.moveDown(0.5);

      // Meta row
      const meta: string[] = [];
      if (publishedDate)     meta.push(`Published: ${publishedDate}`);
      if (article.doi)       meta.push(`DOI: ${article.doi}`);
      if (article.pageStart) meta.push(`Pages: ${article.pageStart}–${article.pageEnd}`);
      if (meta.length > 0) {
        doc.fillColor('#888888').fontSize(8.5).font('Helvetica')
          .text(meta.join('   |   '), LMAR, doc.y, { align: 'center', width: cW });
        doc.moveDown(0.5);
      }

      // Gold divider
      doc.moveTo(LMAR, doc.y).lineTo(PW - LMAR, doc.y).strokeColor('#C8972A').lineWidth(1.5).stroke();
      doc.moveDown(0.9);

      // Abstract
      doc.fillColor('#0B1D51').fontSize(12).font('Helvetica-Bold')
        .text('Abstract', LMAR, doc.y);
      doc.moveDown(0.35);
      doc.fillColor('#333333').fontSize(10).font('Helvetica')
        .text(sub.abstract, LMAR, doc.y, { align: 'justify', width: cW, lineGap: 3.5 });
      doc.moveDown(0.9);

      // Full text sections (if available)
      if (sub.fullText && sub.fullText.trim()) {
        doc.moveTo(LMAR, doc.y).lineTo(PW - LMAR, doc.y).strokeColor('#cbd5e1').lineWidth(0.75).stroke();
        doc.moveDown(0.9);

        const rawSections = sub.fullText.trim().split(/(?=\n\d+\.\s+\S)/);
        for (const raw of rawSections) {
          const trimmed = raw.trim();
          if (!trimmed) continue;

          const m = trimmed.match(/^(\d+\.\s+[^\n]+)\n([\s\S]*)/);
          if (m) {
            doc.fillColor('#0B1D51').fontSize(13).font('Helvetica-Bold')
              .text(m[1].trim(), LMAR, doc.y, { width: cW });
            doc.moveDown(0.35);
            doc.fillColor('#333333').fontSize(10.5).font('Helvetica')
              .text(m[2].trim(), LMAR, doc.y, { align: 'justify', width: cW, lineGap: 4 });
          } else {
            doc.fillColor('#333333').fontSize(10.5).font('Helvetica')
              .text(trimmed, LMAR, doc.y, { align: 'justify', width: cW, lineGap: 4 });
          }
          doc.moveDown(0.9);
        }
      }

      // Keywords – two separate calls, no `continued`, to avoid stream corruption
      if (sub.keywords && sub.keywords.length > 0) {
        const kwLabel = 'Keywords: ';
        const kwValue = sub.keywords.join(', ');
        doc.fillColor('#0B1D51').fontSize(10).font('Helvetica-Bold');
        const lw = doc.widthOfString(kwLabel);
        const kY = doc.y;
        doc.text(kwLabel, LMAR, kY, { lineBreak: false });
        doc.fillColor('#555555').font('Helvetica-Oblique')
          .text(kwValue, LMAR + lw, kY, { width: cW - lw, lineGap: 2 });
        doc.moveDown(0.9);
      }

      // Open-access notice
      doc.moveTo(LMAR, doc.y).lineTo(PW - LMAR, doc.y).strokeColor('#e2e8f0').lineWidth(1).stroke();
      doc.moveDown(0.6);
      doc.fillColor('#888888').fontSize(8).font('Helvetica')
        .text(
          `© ${year} ${jName}. Open-access article distributed under CC BY 4.0 International License.`,
          LMAR, doc.y, { align: 'center', width: cW, lineGap: 2 },
        );

      // ──────────────────────────────────────────────────────────────────────
      // SECOND PASS: stamp navy footer with page numbers on every page.
      // This is safe because we're using bufferPages:true and have finished
      // writing all content — no new pages can be auto-added during this loop.
      // ──────────────────────────────────────────────────────────────────────
      const range = doc.bufferedPageRange(); // e.g. { start: 0, count: 4 }
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        doc.rect(0, PH - 28, PW, 28).fill('#0B1D51');
        doc.fillColor('#aaaaaa').fontSize(7.5).font('Helvetica')
          .text(
            `Daily Solace Journal  ·  ${jName}  ·  Page ${i + 1} of ${range.count}`,
            LMAR, PH - 19,
            { width: cW, align: 'center', lineBreak: false },
          );
      }

      // Flush buffered pages to the output stream, then close
      doc.flushPages();
      doc.end();
    } catch (err) {
      reject(err as Error);
    }
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
            fullText: true,
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
    const sanitizedTitle = article.submission.title.replace(/[^a-z0-9]/gi, '_').slice(0, 60);

    // 1. Serve uploaded file if it exists on disk (skip placeholders and non-existent paths)
    if (file && !file.storagePath.startsWith('http') && !file.storagePath.includes('placeholder')) {
      try {
        if (fs.existsSync(file.storagePath)) {
          prisma.article.update({ where: { id }, data: { downloadCount: { increment: 1 } } }).catch(() => {});
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.pdf"`);
          return res.sendFile(path.resolve(file.storagePath));
        }
      } catch (_) { /* fall through to generation */ }
    }

    // 2. Redirect to external file URL
    if (file && (file.storagePath.startsWith('http://') || file.storagePath.startsWith('https://'))) {
      prisma.article.update({ where: { id }, data: { downloadCount: { increment: 1 } } }).catch(() => {});
      return res.redirect(file.storagePath);
    }

    // 3. Check pdfUrl field for a file on disk
    if (article.pdfUrl && !article.pdfUrl.includes('placeholder')) {
      try {
        const filePath = path.join(process.cwd(), article.pdfUrl);
        if (fs.existsSync(filePath)) {
          prisma.article.update({ where: { id }, data: { downloadCount: { increment: 1 } } }).catch(() => {});
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.pdf"`);
          return res.sendFile(path.resolve(filePath));
        }
      } catch (_) { /* fall through to generation */ }
    }

    // 4. No real file anywhere — generate a complete PDF on-the-fly using PDFKit
    try {
      prisma.article.update({ where: { id }, data: { downloadCount: { increment: 1 } } }).catch(() => {});
      const pdfBuffer = await generateArticlePdf(article as any);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      return res.send(pdfBuffer);
    } catch (pdfErr) {
      console.error('PDFKit generation failed:', pdfErr);
      throw new AppError(500, 'Failed to generate article PDF. Please try again later.');
    }
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

