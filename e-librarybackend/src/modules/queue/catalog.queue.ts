                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      import { Queue, Worker, Job } from 'bullmq';
import { getRedisClient } from '../../config/redis.js';
import prisma from '../../config/database.js';
import { notificationsService } from '../notifications/notifications.service.js';
import { logger } from '../../shared/utils/logger.js';
const QUEUE_NAME = 'catalog-queue';
interface CatalogJobData {
  type: 'check_overdue';
}
let catalogQueue: Queue<CatalogJobData> | null = null;
let catalogWorker: Worker<CatalogJobData> | null = null;
const getCatalogQueue = (): Queue<CatalogJobData> | null => {
  if (!catalogQueue) {
    catalogQueue = new Queue<CatalogJobData>(QUEUE_NAME, {
      connection: getRedisClient(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
        removeOnComplete: 50,
        removeOnFail: 100,
      },
    });
  }
  return catalogQueue;
};
const processCatalogJob = async (job: Job<CatalogJobData>): Promise<void> => {
  const { type } = job.data;
  logger.info('Processing catalog job', { jobId: job.id, type });
  try {
    switch (type) {
      case 'check_overdue': {
        const now = new Date();
        // Find ACTIVE records where dueDate has passed
        const overdueRecords = await prisma.borrowRecord.findMany({
          where: {
            status: 'ACTIVE',
            dueDate: { lt: now },
          },
          include: {
            book: { select: { id: true, title: true } },
            campus: { select: { id: true, name: true } },
          },
        });
        if (overdueRecords.length === 0) {
          logger.info('No overdue records found', { checkedAt: now });
          break;
        }
        // Bulk update to OVERDUE
        const ids = overdueRecords.map((r) => r.id);
        await prisma.borrowRecord.updateMany({
          where: { id: { in: ids } },
          data: { status: 'OVERDUE' },
        });
        // Send one notification per user (aggregate multiple overdue books)
        const byUser = new Map<string, typeof overdueRecords>();
        for (const record of overdueRecords) {
          const list = byUser.get(record.userId) ?? [];
          list.push(record);
          byUser.set(record.userId, list);
        }
        const notificationPromises = Array.from(byUser.entries()).map(([userId, records]) => {
          const bookTitles = records.map((r) => `"${r.book.title}"`).join(', ');
          const count = records.length;
          return notificationsService.createNotification({
            userId,
            type: 'warning',
            title: count === 1 ? 'Overdue Book Reminder' : `${count} Overdue Books`,
            message: `The following borrowed book${count > 1 ? 's are' : ' is'} overdue: ${bookTitles}. Please return them to the library as soon as possible.`,
            data: { borrowIds: records.map((r) => r.id) },
          }).catch((err) => logger.warn('Failed to send overdue notification', { userId, err }));
        });
        await Promise.all(notificationPromises);
        logger.info('Overdue check completed', {
          overdueCount: overdueRecords.length,
          usersNotified: byUser.size,
        });
        break;
      }
      default:
        logger.error('Unknown catalog job type', { type });
    }
  } catch (error) {
    logger.error('Catalog job failed', { jobId: job.id, type, error });
    throw error;
  }
};
export const startCatalogWorker = (): void => {
  if (!catalogWorker) {
    catalogWorker = new Worker<CatalogJobData>(QUEUE_NAME, processCatalogJob, {
      connection: getRedisClient(),
      concurrency: 2,
    });
    catalogWorker.on('completed', (job) => {
      logger.info('Catalog job completed', { jobId: job.id });
    });
    catalogWorker.on('failed', (job, error) => {
      logger.error('Catalog job failed', { jobId: job?.id, error: error.message });
    });
    logger.info('Catalog worker started');
  }
};
export const stopCatalogWorker = async (): Promise<void> => {
  if (catalogWorker) {
    await catalogWorker.close();
    catalogWorker = null;
  }
  if (catalogQueue) {
    await catalogQueue.close();
    catalogQueue = null;
  }
};
export const scheduleCatalogJobs = {
  /**
   * Schedule a daily overdue check. Designed to be called with a repeatable
   * cron job on startup — BullMQ deduplicates by jobId so it's safe to call
   * on every server start.
   */
  scheduleOverdueCheck: async (): Promise<void> => {
    const queue = getCatalogQueue();
    if (queue) {
      await queue.upsertJobScheduler(
        'daily-overdue-check',
        { pattern: '0 1 * * *' }, // runs every day at 01:00
        {
          name: 'check_overdue',
          data: { type: 'check_overdue' },
          opts: { removeOnComplete: 10, removeOnFail: 20 },
        }
      );
      logger.info('Overdue check scheduler registered (daily at 01:00)');
    }
  },
};