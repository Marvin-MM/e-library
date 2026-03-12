import { Queue, Worker, Job } from 'bullmq';
import { getRedisClient, isRedisConnected } from '../../config/redis.js';
import prisma from '../../config/database.js';
import { logger } from '../../shared/utils/logger.js';

const QUEUE_NAME = 'analytics-queue';

interface AnalyticsJobData {
  type: 'daily_aggregation' | 'cleanup_tokens';
  date?: string;
}

let analyticsQueue: Queue<AnalyticsJobData> | null = null;
let analyticsWorker: Worker<AnalyticsJobData> | null = null;

const getAnalyticsQueue = (): Queue<AnalyticsJobData> | null => {
  if (!isRedisConnected()) {
    logger.warn('Redis not connected, analytics queue disabled');
    return null;
  }

  if (!analyticsQueue) {
    analyticsQueue = new Queue<AnalyticsJobData>(QUEUE_NAME, {
      connection: getRedisClient(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    });
  }

  return analyticsQueue;
};

const processAnalyticsJob = async (job: Job<AnalyticsJobData>): Promise<void> => {
  const { type, date } = job.data;
  logger.info('Processing analytics job', { jobId: job.id, type });

  try {
    switch (type) {
      case 'daily_aggregation': {
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const [downloads, searches, topSearchTerms, topResources, usersByRole] = await Promise.all([
          prisma.downloadLog.count({
            where: {
              timestamp: { gte: targetDate, lt: nextDay },
            },
          }),
          prisma.searchLog.count({
            where: {
              timestamp: { gte: targetDate, lt: nextDay },
            },
          }),
          prisma.searchLog.groupBy({
            by: ['query'],
            _count: { query: true },
            where: {
              timestamp: { gte: targetDate, lt: nextDay },
            },
            orderBy: { _count: { query: 'desc' } },
            take: 20,
          }),
          prisma.resource.findMany({
            where: {
              downloadLogs: {
                some: {
                  timestamp: { gte: targetDate, lt: nextDay },
                },
              },
            },
            select: {
              id: true,
              title: true,
              _count: {
                select: { downloadLogs: true },
              },
            },
            orderBy: {
              downloadLogs: { _count: 'desc' },
            },
            take: 20,
          }),
          prisma.user.groupBy({
            by: ['role'],
            _count: { role: true },
          }),
        ]);

        await prisma.analytics.upsert({
          where: { date: targetDate },
          update: {
            totalDownloads: downloads,
            totalSearches: searches,
            topSearchTerms: topSearchTerms.map(t => ({ query: t.query, count: t._count.query })),
            topResources: topResources.map(r => ({ id: r.id, title: r.title, downloads: r._count.downloadLogs })),
            usersByRole: Object.fromEntries(usersByRole.map(u => [u.role, u._count.role])),
          },
          create: {
            date: targetDate,
            totalDownloads: downloads,
            totalSearches: searches,
            topSearchTerms: topSearchTerms.map(t => ({ query: t.query, count: t._count.query })),
            topResources: topResources.map(r => ({ id: r.id, title: r.title, downloads: r._count.downloadLogs })),
            usersByRole: Object.fromEntries(usersByRole.map(u => [u.role, u._count.role])),
          },
        });

        logger.info('Daily analytics aggregation completed', { date: targetDate.toISOString() });
        break;
      }

      case 'cleanup_tokens': {
        const result = await prisma.blacklistedToken.deleteMany({
          where: {
            expiresAt: { lt: new Date() },
          },
        });

        logger.info('Expired tokens cleaned up', { count: result.count });
        break;
      }

      default:
        logger.error('Unknown analytics job type', { type });
    }
  } catch (error) {
    logger.error('Analytics job failed', { jobId: job.id, type, error });
    throw error;
  }
};

export const startAnalyticsWorker = (): void => {
  if (!isRedisConnected()) {
    logger.warn('Redis not connected, analytics worker not started');
    return;
  }

  if (!analyticsWorker) {
    const connection = getRedisClient();
    analyticsWorker = new Worker<AnalyticsJobData>(QUEUE_NAME, processAnalyticsJob, {
      connection,
      concurrency: 1, // analytics jobs are heavy DB aggregations — sequential is safer
    });

    analyticsWorker.on('completed', (job) => {
      logger.info('Analytics job completed', { jobId: job.id });
    });

    analyticsWorker.on('failed', (job, error) => {
      logger.error('Analytics job failed', { jobId: job?.id, error: error.message });
    });

    analyticsWorker.on('error', (error) => {
      logger.error('Analytics worker error', { error: error.message });
    });

    logger.info('Analytics worker started');
  }
};

export const stopAnalyticsWorker = async (): Promise<void> => {
  if (analyticsWorker) {
    await analyticsWorker.close();
    analyticsWorker = null;
  }
  if (analyticsQueue) {
    await analyticsQueue.close();
    analyticsQueue = null;
  }
};

export const scheduleAnalytics = {
  /**
   * Registers a daily analytics aggregation at 02:00.
   * BullMQ upsertJobScheduler is idempotent — safe to call on every server start.
   */
  scheduleDailyAggregation: async (): Promise<void> => {
    const queue = getAnalyticsQueue();
    if (queue) {
      await queue.upsertJobScheduler(
        'daily-analytics-aggregation',
        { pattern: '0 2 * * *' }, // every day at 02:00
        {
          name: 'daily_aggregation',
          data: { type: 'daily_aggregation' },
          opts: { removeOnComplete: 10, removeOnFail: 20 },
        }
      );
      logger.info('Daily analytics aggregation scheduler registered (02:00)');
    }
  },

  /**
   * Registers a daily token cleanup at 03:00.
   */
  scheduleTokenCleanup: async (): Promise<void> => {
    const queue = getAnalyticsQueue();
    if (queue) {
      await queue.upsertJobScheduler(
        'daily-token-cleanup',
        { pattern: '0 3 * * *' }, // every day at 03:00
        {
          name: 'cleanup_tokens',
          data: { type: 'cleanup_tokens' },
          opts: { removeOnComplete: 10, removeOnFail: 20 },
        }
      );
      logger.info('Daily token cleanup scheduler registered (03:00)');
    }
  },
};
