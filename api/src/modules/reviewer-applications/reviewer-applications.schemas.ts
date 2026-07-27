import { z } from 'zod';

export const createApplicationSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  institution: z.string().min(1).max(200),
  department: z.string().max(100).optional(),
  designation: z.string().max(100).optional(),
  highestQualification: z.string().max(100).optional(),
  country: z.string().min(1).max(100),
  orcid: z.string().max(50).optional(),
  scopusId: z.string().max(50).optional(),
  googleScholar: z.string().url().optional().or(z.literal('')),
  researchAreas: z.array(z.string()).min(1),
  bio: z.string().max(1000).optional(),
  cvUrl: z.string().url().optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  adminNote: z.string().optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
