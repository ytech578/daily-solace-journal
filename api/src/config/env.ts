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

  // AWS S3
  AWS_REGION: z.string().default('placeholder'),
  AWS_ACCESS_KEY_ID: z.string().default('placeholder'),
  AWS_SECRET_ACCESS_KEY: z.string().default('placeholder'),
  AWS_S3_BUCKET_NAME: z.string().default('placeholder'),

  // Email Microservice (Forwarded to Vercel Next.js)
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  EMAIL_SERVICE_SECRET: z.string().default('placeholder_secret'),
  EMAIL_FROM: z.string().default('Daily Solace Journal <no-reply@dailysolacejournal.org>'),

  // Razorpay (APC payments)
  RAZORPAY_KEY_ID: z.string().default('placeholder'),
  RAZORPAY_KEY_SECRET: z.string().default('placeholder'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('placeholder'),

  // CrossRef DOI registration
  CROSSREF_USER: z.string().default('placeholder'),
  CROSSREF_PASSWORD: z.string().default('placeholder'),
  CROSSREF_DEPOSITOR_NAME: z.string().default('Daily Solace Journal'),
  CROSSREF_DEPOSITOR_EMAIL: z.string().email().default('dois@dailysolacejournal.com'),
});

export const env = envSchema.parse(process.env);
