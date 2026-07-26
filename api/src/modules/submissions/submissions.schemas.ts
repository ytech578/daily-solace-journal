import { z } from 'zod';

const coAuthorSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  institution: z.string().max(200).optional(),
  order: z.number().int().min(1),
});

export const createSubmissionSchema = z.object({
  journalId: z.string().cuid(),
  title: z.string().min(5).max(300),
  abstract: z.string().min(50).max(5000),
  keywords: z.array(z.string().min(1).max(60)).min(3).max(10),
  coverLetter: z.string().max(3000).optional(),
  subjectId: z.string().cuid().optional(),
  coAuthors: z.array(coAuthorSchema).max(20).optional().default([]),
});

export const updateSubmissionSchema = createSubmissionSchema.partial().omit({ journalId: true });

export const submitRevisionSchema = z.object({
  responseNote: z.string().min(10).max(5000),
});

export const editorDecisionSchema = z.object({
  decision: z.enum(['ACCEPTED', 'REVISION_NEEDED', 'REJECTED']),
  note: z.string().max(3000).optional(),
});

export const assignReviewerSchema = z.object({
  reviewerId: z.string().cuid(),
  dueDate: z.string().datetime().optional(),
});

export const submitReviewSchema = z.object({
  recommendation: z.enum(['ACCEPT', 'MINOR_REVISION', 'MAJOR_REVISION', 'REJECT']),
  originality: z.number().int().min(1).max(5).optional(),
  methodology: z.number().int().min(1).max(5).optional(),
  clarity: z.number().int().min(1).max(5).optional(),
  significance: z.number().int().min(1).max(5).optional(),
  commentsToAuthor: z.string().min(50).max(10000),
  commentsToEditor: z.string().max(5000).optional(),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type UpdateSubmissionInput = z.infer<typeof updateSubmissionSchema>;
export type SubmitRevisionInput = z.infer<typeof submitRevisionSchema>;
export type EditorDecisionInput = z.infer<typeof editorDecisionSchema>;
export type AssignReviewerInput = z.infer<typeof assignReviewerSchema>;
export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
