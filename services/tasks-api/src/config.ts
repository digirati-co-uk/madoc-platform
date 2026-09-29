import { getConfig } from './utility/get-config';
import { AppConfig } from './types';
import * as path from 'path';
import { castStringNumber } from './utility/cast-string-number';

const baseConfig = getConfig(process.cwd());

export const config: AppConfig = {
  queue: baseConfig,
  log: true,
  enableQueue: !!process.env.REDIS_HOST,
  // Defaults to true, unless MIGRATE=0 or MIGRATE=false
  migrate: process.env.MIGRATE ? !(process.env.MIGRATE.toLowerCase() === 'false' || process.env.MIGRATE === '0') : true,
  migrationsPath: path.join(process.cwd(), 'migrations'),
  postgres: {
    host: process.env.DATABASE_HOST as string,
    port: process.env.DATABASE_PORT ? +process.env.DATABASE_PORT : 5432,
    username: process.env.DATABASE_USER as string,
    password: process.env.DATABASE_PASSWORD as string,
    database: process.env.DATABASE_NAME as string,
  },
  env: process.env.NODE_ENV || 'development',
  queueList: process.env.QUEUE_LIST ? process.env.QUEUE_LIST.split(',') : [],
  redis: {
    host: process.env.REDIS_HOST,
    db: Number(process.env.REDIS_DB ? process.env.REDIS_DB : '2'),
  },
  bullmq: {
    defaultJobOptions: {
      attempts: castStringNumber(process.env.QUEUE_RETRY_ATTEMPTS, 5),
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    },
  },
};

export const port = process.env.SERVER_PORT || 3000;
