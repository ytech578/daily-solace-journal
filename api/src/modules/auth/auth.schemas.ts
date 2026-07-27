import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  institution: z.string().max(200).optional(),
  country: z.string().max(100).optional(),
});

export const registerExtendedSchema = z.object({
  firstName: z.string().min(1).max(50),
  middleName: z.string().max(50).optional(),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8),
  phone: z.string().max(20).optional(),
  
  institution: z.string().min(2).max(200),
  department: z.string().max(100).optional(),
  designation: z.string().max(100).optional(),
  country: z.string().min(2).max(100),
  state: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  orcid: z.string().max(50).optional(),
  scopusId: z.string().max(50).optional(),
  googleScholar: z.string().url().optional().or(z.literal('')),
  researchGate: z.string().url().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  researchInterests: z.array(z.string()).optional(),
  highestQualification: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterExtendedInput = z.infer<typeof registerExtendedSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
