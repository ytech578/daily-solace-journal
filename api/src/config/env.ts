import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),

  // File storage
  UPLOAD_DIR: z.string().default('uploads'),
  MAX_FILE_SIZE_MB: z.coerce.number().default(20),

  // Resend (transactional email)
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().default('Daily Solace Journal <no-reply@dailysolacejournal.com>'),

  // Razorpay (APC payments)
  RAZORPAY_KEY_ID: z.string().min(1),
  RAZORPAY_KEY_SECRET: z.string().min(1),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(1),

  // CrossRef DOI registration
  CROSSREF_USER: z.string().min(1),
  CROSSREF_PASSWORD: z.string().min(1),
  CROSSREF_DEPOSITOR_NAME: z.string().default('Daily Solace Journal'),
  CROSSREF_DEPOSITOR_EMAIL: z.string().email().default('dois@dailysolacejournal.com'),
});

export const env = envSchema.parse(process.env);
