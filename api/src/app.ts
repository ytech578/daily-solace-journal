import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { submissionsRouter } from './modules/submissions/submissions.routes';
import { editorialRouter } from './modules/reviews/editorial.routes';
import { reviewAssignmentsRouter } from './modules/reviews/review-assignments.routes';
import { publishRouter } from './modules/publication/publish.routes';
import { articlesRouter } from './modules/publication/articles.routes';
import { adminRouter } from './modules/admin/admin.routes';
import { notificationsRouter } from './modules/notifications/notifications.routes';
import { searchRouter } from './modules/search/search.routes';
import { journalsRouter } from './modules/journals/journals.routes';
import { reviewerApplicationsRouter } from './modules/reviewer-applications/reviewer-applications.routes';

export const app = express();

// ─── Core middleware ──────────────────────────────────────────────────────────

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(cookieParser());

// Raw body for Razorpay webhook signature verification (must be before json parser)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

// ─── Static assets ────────────────────────────────────────────────────────────

app.use('/uploads', express.static(path.resolve(process.cwd(), env.UPLOAD_DIR)));

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({ status: 'ok', env: env.NODE_ENV }));

// ─── API routes ───────────────────────────────────────────────────────────────

// Auth & Users
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);

// Journal directory
app.use('/api/journals', journalsRouter);

// Submissions (author + editor views share the mount point)
app.use('/api/submissions', submissionsRouter);
app.use('/api/submissions', editorialRouter); // /:id/assign-reviewer, /:id/decision, /:id/reviews

// Reviews
app.use('/api/review-assignments', reviewAssignmentsRouter);

// Publication (volumes, issues, article publish, APC)
app.use('/api', publishRouter);
app.use('/api/articles', articlesRouter);

// Search
app.use('/api/search', searchRouter);

// Notifications
app.use('/api/notifications', notificationsRouter);

// Admin
app.use('/api/admin', adminRouter);

// Reviewer Applications
app.use('/api/reviewer-applications', reviewerApplicationsRouter);

// ─── Error handling ───────────────────────────────────────────────────────────

app.use(notFoundHandler);
app.use(errorHandler);