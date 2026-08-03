import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { generateDoi, registerDoi } from '../../services/crossref.service';
import { notificationsService } from '../notifications/notifications.service';
import { emailService } from '../../services/email.service';
import { createApcOrder, verifyAndConfirmPayment } from '../../services/payment.service';

// ─── Volumes ──────────────────────────────────────────────────────────────────

export async function createVolume(journalId: string, number: number, year: number) {
  return prisma.volume.create({ data: { journalId, number, year } });
}

export async function listVolumes(journalId: string) {
  return prisma.volume.findMany({
    where: { journalId },
    include: {
      issues: {
        include: { _count: { select: { articles: true } } },
        orderBy: { number: 'asc' },
      },
    },
    orderBy: { number: 'desc' },
  });
}

// ─── Issues ───────────────────────────────────────────────────────────────────

export async function createIssue(volumeId: string, number: number, title?: string) {
  return prisma.issue.create({ data: { volumeId, number, title } });
}

export async function publishIssue(issueId: string) {
  const issue = await prisma.issue.findUnique({ where: { id: issueId } });
  if (!issue) throw new AppError(404, 'Issue not found');
  return prisma.issue.update({
    where: { id: issueId },
    data: { isPublished: true, publicationDate: new Date() },
  });
}

export async function getCurrentIssue(journalId: string) {
  // Most recently published issue for the journal (via volume relation)
  const issue = await prisma.issue.findFirst({
    where: {
      isPublished: true,
      volume: { journalId },
    },
    include: {
      volume: true,
      articles: {
        include: {
          submission: {
            select: { title: true, abstract: true, keywords: true, coAuthors: { orderBy: { order: 'asc' } }, author: { select: { name: true } } },
          },
          subject: true,
        },
        orderBy: { pageStart: 'asc' },
      },
    },
    orderBy: { publicationDate: 'desc' },
  });
  if (!issue) throw new AppError(404, 'No published issue found');
  return issue;
}

// ─── Publish article ──────────────────────────────────────────────────────────

export async function publishArticle(submissionId: string, editorId: string, opts: {
  issueId: string;
  pageStart?: number;
  pageEnd?: number;
}) {
  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { journal: true, author: true },
  });
  if (!submission) throw new AppError(404, 'Submission not found');
  if (submission.status !== 'ACCEPTED') throw new AppError(400, 'Submission must be ACCEPTED before publishing');

  const issue = await prisma.issue.findUnique({ where: { id: opts.issueId } });
  if (!issue) throw new AppError(404, 'Issue not found');

  // Generate DOI if the journal has a prefix
  let doi: string | undefined;
  if (submission.journal.doiPrefix) {
    doi = generateDoi({ doiPrefix: submission.journal.doiPrefix }, submissionId);
  }

  const article = await prisma.$transaction(async (tx) => {
    const publicUrl = submission.title
      .toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      + '-' + Date.now();
    const a = await tx.article.create({
      data: {
        submissionId,
        journalId: submission.journalId,
        title: submission.title,
        abstract: submission.abstract,
        publicUrl,
        issueId: opts.issueId,
        subjectId: submission.subjectId,
        doi,
        pageStart: opts.pageStart,
        pageEnd: opts.pageEnd,
        publishedAt: new Date(),
      },
    });
    await tx.submission.update({
      where: { id: submissionId },
      data: { status: 'PUBLISHED' },
    });
    await tx.submissionEvent.create({
      data: { submissionId, actorId: editorId, type: 'PUBLISHED', note: `Published to issue ${opts.issueId}` },
    });
    return a;
  });

  // Register DOI with CrossRef asynchronously (don't block response)
  if (doi && submission.journal.doiPrefix) {
    registerDoi(article.id).catch((err) =>
      console.error('CrossRef DOI deposit failed:', err),
    );
  }

  // Notify author
  await notificationsService.create({
    userId: submission.authorId,
    type: 'PAPER_PUBLISHED',
    title: '🎉 Your paper has been published!',
    body: `"${submission.title}" is now live in ${submission.journal.name}`,
    link: `/articles/${article.id}`,
  });

  return article;
}

// ─── APC Payment ──────────────────────────────────────────────────────────────

export { createApcOrder, verifyAndConfirmPayment };
