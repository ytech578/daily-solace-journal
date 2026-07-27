import { z } from 'zod';

export const updateRoleSchema = z.object({
  role: z.enum(['AUTHOR', 'REVIEWER', 'EDITOR', 'ADMIN']),
});

export const inviteEditorSchema = z.object({
  email: z.string().email(),
});

export const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type InviteEditorInput = z.infer<typeof inviteEditorSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;