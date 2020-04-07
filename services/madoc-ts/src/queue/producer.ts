import { Worker } from 'bullmq';

const configOptions = {
  connection: {
    host: process.env.REDIS_HOST,
    db: 2,
  },
};

const worker = new Worker(
  'tasks-api',
  async job => {
    switch (job.name) {
      case 'created':
        console.log('Task ID created', job.data.taskId);
        break;
    }

    // Artificial timeout.
    await new Promise(resolve => setTimeout(resolve, 500));
  },
  configOptions
);

console.log(`Worker ${worker.name} started...`);
