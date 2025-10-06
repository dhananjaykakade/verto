import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger.js';

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
  ],
});

prisma.$on('error', (e) => {
  logger.error({ msg: 'Prisma error', err: e });
});

prisma.$on('query', (e) => {
  logger.debug({ msg: 'Prisma query', query: e.query, params: e.params, duration: e.duration });
});
