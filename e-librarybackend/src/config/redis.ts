import {Redis} from 'ioredis';
import { config } from './index.js';
import { logger } from '../shared/utils/logger.js';

let redis: Redis | null = null;

export const getRedisClient = (): Redis => {
  if (!redis) {
    redis = new Redis(config.redis.url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn('Redis connection failed after 3 retries, running without Redis');
          return null;
        }
        return Math.min(times * 100, 3000);
      },
    });

    redis.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    redis.on('error', (error) => {
      logger.error('Redis connection error', { error: error.message });
    });

    redis.on('close', () => {
      logger.warn('Redis connection closed');
    });
  }

  return redis;
};

export const closeRedisConnection = async (): Promise<void> => {
  if (redis) {
    await redis.quit();
    redis = null;
    logger.info('Redis connection closed');
  }
};

export const isRedisConnected = (): boolean => {
  return redis?.status === 'ready';
};

export const waitForRedis = async (): Promise<void> => {
  const client = getRedisClient();
  if (client.status === 'ready') return;
  return new Promise((resolve, reject) => {
    const onReady = () => {
      client.removeListener('error', onError);
      resolve();
    };
    const onError = (err: any) => {
      client.removeListener('ready', onReady);
      reject(err);
    };
    client.once('ready', onReady);
    client.once('error', onError);
    
    // Also resolve on timeout so the server doesn't hang indefinitely without Redis
    setTimeout(() => {
      client.removeListener('ready', onReady);
      client.removeListener('error', onError);
      resolve();
    }, 5000);
  });
};

export default getRedisClient;
