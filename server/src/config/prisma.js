import { PrismaClient } from '@prisma/client';

const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

export const isPostgres = Boolean(
  process.env.DATABASE_URL &&
    (process.env.DATABASE_URL.startsWith('postgres://') ||
      process.env.DATABASE_URL.startsWith('postgresql://'))
);

/**
 * Returns a search filter object compatible with both PostgreSQL and SQLite.
 * SQLite throws an error if mode: 'insensitive' is passed to Prisma.
 */
export function stringFilter(term) {
  if (!term) return undefined;
  return isPostgres
    ? { contains: term, mode: 'insensitive' }
    : { contains: term };
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

