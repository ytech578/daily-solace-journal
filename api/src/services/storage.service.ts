import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { env } from '../config/env';
import { AppError } from '../middleware/errorHandler';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';

const MAX_BYTES = env.MAX_FILE_SIZE_MB * 1024 * 1024;

// ─── AWS S3 Client ────────────────────────────────────────────────────────────

const useS3 = env.AWS_S3_BUCKET_NAME !== 'placeholder' && env.AWS_ACCESS_KEY_ID !== 'placeholder';

const s3Client = useS3
  ? new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getStorageEngine(subfolder: string) {
  if (useS3 && s3Client) {
    return multerS3({
      s3: s3Client,
      bucket: env.AWS_S3_BUCKET_NAME,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${subfolder}/${uuidv4()}${ext}`);
      },
    });
  } else {
    // Fallback to local disk storage
    const dest = path.resolve(process.cwd(), env.UPLOAD_DIR, subfolder);
    ensureDir(dest);
    return multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, dest),
      filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `${uuidv4()}${ext}`);
      },
    });
  }
}

// ─── Manuscript upload (PDF / Word only) ──────────────────────────────────────

const MANUSCRIPT_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const manuscriptUpload = multer({
  storage: getStorageEngine('manuscripts'),
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (MANUSCRIPT_MIME.includes(file.mimetype)) return cb(null, true);
    cb(new AppError(400, 'Only PDF and Word documents are accepted for manuscripts'));
  },
});

// ─── Avatar upload (images only) ─────────────────────────────────────────────

const AVATAR_MIME = ['image/jpeg', 'image/png', 'image/webp'];

export const avatarUpload = multer({
  storage: getStorageEngine('avatars'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (AVATAR_MIME.includes(file.mimetype)) return cb(null, true);
    cb(new AppError(400, 'Only JPEG, PNG and WebP images are accepted for avatars'));
  },
});

// ─── Generic file upload (supplementary materials) ───────────────────────────

export const supplementaryUpload = multer({
  storage: getStorageEngine('supplementary'),
  limits: { fileSize: MAX_BYTES },
});

// ─── Utility: build the public URL for a stored file ─────────────────────────

export function fileUrl(storagePath: string): string {
  if (storagePath.startsWith('http://') || storagePath.startsWith('https://')) {
    return storagePath;
  }
  
  const uploadsRoot = path.resolve(process.cwd(), env.UPLOAD_DIR);
  const relative = path.relative(uploadsRoot, storagePath).replace(/\\/g, '/');
  return `/uploads/${relative}`;
}
