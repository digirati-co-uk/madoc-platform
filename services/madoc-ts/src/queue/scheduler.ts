import { QueueScheduler, QueueSchedulerOptions } from 'bullmq';

const configOptions: QueueSchedulerOptions = {
  connection: {
    host: process.env.REDIS_HOST,
    db: 2,
  },
};

const scheduler = new QueueScheduler('tasks-api', configOptions);

console.log(`Scheduler ${scheduler.name} started...`);
