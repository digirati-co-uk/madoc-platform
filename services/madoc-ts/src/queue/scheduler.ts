import { QueueScheduler, QueueSchedulerOptions, QueueEvents } from 'bullmq';

const configOptions: QueueSchedulerOptions = {
  connection: {
    host: process.env.REDIS_HOST,
    db: 2,
  },
};

const scheduler = new QueueScheduler('madoc-ts', configOptions);
const queueEvents = new QueueEvents('madoc-ts', configOptions);

if (process.env.NODE_ENV !== 'production') {
  queueEvents.on('completed', jobId => {
    console.log('done', jobId);
  });
  queueEvents.on('waiting', ({ jobId }) => {
    console.log(`A job with ID ${jobId} is waiting`);
  });
}

queueEvents.on('failed', (jobId, err) => {
  console.error('Job failed with error error', jobId, err);
});

console.log(`Scheduler ${scheduler.name} starting...`);

scheduler
  .waitUntilReady()
  .then(() => {
    console.log(`Scheduler ${scheduler.name} started...`);
  })
  .catch(e => {
    console.log(e);
    console.log(`Scheduler ${scheduler.name} error`);
    throw e; // Will restart.
  });
