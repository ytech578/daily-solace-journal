import { prisma } from '../../lib/prisma';
import { AppError } from '../../middleware/errorHandler';
import { emailService } from '../../services/email.service';
import { notificationsService } from '../notifications/notifications.service';
import type {
  CreateSubmissionInput,
  UpdateSubmissionInput,
  SubmitRevisionInput,
} from './submissions.schemas';

// Shared select for listing — keeps payload small
const LIST_SELECT = {
  id: true,
  title: true,
  abstract: true,
  keywords: true,
  status: true,
  submittedAt: true,
  createdAt: true,
  updatedAt: true,
  journal: { select: { id: true, name: true, slug: true } },
  subject: { select: { id: true, name: true } },
  author: { select: { id: true, name: true, email: true } },
  _count: { select: { assignments: true } },
} as const;

const DETAIL_INCLUDE = {
  journal: { select: { id: true, name: true, slug: true, apcAmount: true, currency: true } },
  subject: { select: { id: true, name: true } },
  author: { select: { id: true, name: true, email: true, institution: true } },
  coAuthors: { orderBy: { order: 'asc' as const } },
  files: { orderBy: { uploadedAt: 'desc' as const } },
  events: { orderBy: { createdAt: 'desc' as const } },
  assignments: {
    include: {
      reviewer: { select: { id: true, name: true, email: true } },
      review: true,
    },
  },
  payment: true,
} as const;

// ─── Author-facing CRUD ───────────────────────────────────────────────────────

export async function createDraft(authorId: string, input: CreateSubmissionInput) {
  const { coAuthors = [], ...rest } = input;

  return prisma.submission.create({
    data: {
      ...rest,
      authorId,
      coAuthors: {
        create: coAuthors,
      },
    },
    select: LIST_SELECT,
  });
}

export async function listMySubmissions(authorId: string) {
  return prisma.submission.findMany({
    where: { authorId },
    select: LIST_SELECT,
    orderBy: { updatedAt: 'desc' },
  });
}

export async function getSubmissionForAuthor(id: string, authorId: string) {
  const sub = await prisma.submission.findUnique({
    where: { id },
    include: DETAIL_INCLUDE,
  });
  if (!sub) throw new AppError(404, 'Submission not found');
  if (sub.authorId !== authorId) throw new AppError(403, 'Forbidden');
  return sub;
}

export async function updateDraft(id: string, authorId: string, input: UpdateSubmissionInput) {
  const sub = await prisma.submission.findUnique({ where: { id } });
  if (!sub) throw new AppError(404, 'Submission not found');
  if (sub.authorId !== authorId) throw new AppError(403, 'Forbidden');
  if (sub.status !== 'DRAFT') throw new AppError(400, 'Only draft submissions can be edited');

  const { coAuthors: _coAuthors, subjectId, ...scalarFields } = input;

  return prisma.submission.update({
    where: { id },
    data: {
      ...scalarFields,
      ...(subjectId !== undefined
        ? { subject: subjectId ? { connect: { id: subjectId } } : { disconnect: true } }
        : {}),
    },
    select: LIST_SELECT,
  });
}

// Transition: DRAFT → SUBMITTED
export async function submitSubmission(id: string, authorId: string) {
  const sub = await prisma.submission.findUnique({
    where: { id },
    include: { author: true, journal: true, files: true },
  });
  if (!sub) throw new AppError(404, 'Submission not found');
  if (sub.authorId !== authorId) throw new AppError(403, 'Forbidden');
  if (sub.status !== 'DRAFT') throw new AppError(400, 'Submission is not in DRAFT status');

  const hasManuscript = sub.files.some((f) => f.type === 'MANUSCRIPT');
  if (!hasManuscript) throw new AppError(400, 'A manuscript file is required before submitting');

  const updated = await prisma.$transaction([
    prisma.submission.update({
      where: { id },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    }),
    prisma.submissionEvent.create({
      data: { submissionId: id, actorId: authorId, type: 'SUBMITTED', note: 'Manuscript submitted for review' },
    }),
  ]);

  // Notify editors (all EDITOR/ADMIN users for now)
  const editors = await prisma.user.findMany({ where: { role: { in: ['EDITOR', 'ADMIN'] } } });
  for (const editor of editors) {
    await notificationsService.create({
      userId: editor.id,
      type: 'SUBMISSION_RECEIVED',
      title: 'New submission received',
      body: `"${sub.title}" has been submitted to ${sub.journal.name}`,
      link: `/editor/submissions/${id}`,
    });
  }

  return updated[0];
}

// Transition: REVISION_NEEDED → REVISED
export async function submitRevision(id: string, authorId: string, input: SubmitRevisionInput, fileUploaded: boolean) {
  const sub = await prisma.submission.findUnique({ where: { id }, include: { author: true, journal: true } });
  if (!sub) throw new AppError(404, 'Submission not found');
  if (sub.authorId !== authorId) throw new AppError(403, 'Forbidden');
  if (sub.status !== 'REVISION_NEEDED') throw new AppError(400, 'Submission is not awaiting revision');
  if (!fileUploaded) throw new AppError(400, 'A revised manuscript file is required');

  await prisma.$transaction([
    prisma.submission.update({ where: { id }, data: { status: 'REVISED' } }),
    prisma.submissionEvent.create({
      data: {
        submissionId: id,
        actorId: authorId,
        type: 'REVISED',
        note: `Author response: ${input.responseNote}`,
      },
    }),
  ]);

  const editors = await prisma.user.findMany({ where: { role: { in: ['EDITOR', 'ADMIN'] } } });
  for (const editor of editors) {
    await notificationsService.create({
      userId: editor.id,
      type: 'REVISION_REQUESTED',
      title: 'Revision submitted',
      body: `"${sub.title}" has been revised and is ready for re-review`,
      link: `/editor/submissions/${id}`,
    });
  }
}

// ─── Editor-facing list ───────────────────────────────────────────────────────

export async function listAllSubmissions(filters: {
  status?: string;
  journalId?: string;
  page?: number;
}) {
  const { status, journalId, page = 1 } = filters;
  const take = 20;
  const skip = (page - 1) * take;

  const where = {
    ...(status ? { status: status as never } : {}),
    ...(journalId ? { journalId } : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.submission.findMany({ where, select: LIST_SELECT, orderBy: { updatedAt: 'desc' }, take, skip }),
    prisma.submission.count({ where }),
  ]);

  return { items, total, page, pageCount: Math.ceil(total / take) };
}

export async function getSubmissionForEditor(id: string) {
  const sub = await prisma.submission.findUnique({ where: { id }, include: DETAIL_INCLUDE });
  if (!sub) throw new AppError(404, 'Submission not found');
  return sub;
}

// Attach a file record after multer saves the file to disk
export async function attachFile(submissionId: string, fileData: {
  type: string;
  filename: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  version?: number;
}) {
  return prisma.submissionFile.create({
    data: { submissionId, ...fileData } as never,
  });
}
