import { z } from 'zod';

export const updateRoleSchema = z.object({
  role: z.enum(['AUTHOR', 'REVIEWER', 'EDITOR', 'ADMIN']),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;