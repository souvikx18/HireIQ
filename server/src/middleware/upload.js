import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { config } from '../config/index.js';

// Ensure upload destination exists
if (!fs.existsSync(config.upload.dir)) {
  fs.mkdirSync(config.upload.dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.upload.dir);
  },
  filename: (_req, file, cb) => {
    // Generate secure random UUID filename with sanitized extension
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.pdf', '.docx', '.doc', '.txt'].includes(ext) ? ext : '.pdf';
    const randomName = `${Date.now()}-${crypto.randomBytes(12).toString('hex')}${safeExt}`;
    cb(null, randomName);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const validExt = ['.pdf', '.docx', '.doc', '.txt'].includes(ext);

  if (allowed.includes(file.mimetype) || validExt) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only PDF, DOCX, DOC, and TXT files are accepted.'));
  }
};

export const uploadResume = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter,
});
