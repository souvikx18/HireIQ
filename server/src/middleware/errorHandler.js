import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';

export const errorHandler = (err, req, res, _next) => {
  logger.error(`Unhandled Error on ${req.method} ${req.url}:`, err);

  // Prisma unique constraint error (P2002)
  if (err.code === 'P2002') {
    const fields = err.meta?.target ? err.meta.target.join(', ') : 'field';
    return sendError(res, `A record with this ${fields} already exists`, 409);
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 'File size exceeds maximum allowed limit of 10MB', 400);
    }
    return sendError(res, `File upload error: ${err.message}`, 400);
  }

  const statusCode = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected server error occurred'
      : err.message || 'Internal Server Error';

  return sendError(res, message, statusCode);
};
