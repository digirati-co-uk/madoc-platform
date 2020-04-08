import { Worker } from 'bullmq';
import { getTaskById } from '../gateway/tasks';

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

      case 'subtask_type_status.type-a.1':
        console.log('ALL TASKS ARE of type A are at status 1');
        break;

      case 'created': {
        console.log('Fetching task...');
        const fullTask = await getTaskById(job.data.taskId);
        console.log('Task ID created', fullTask);
        break;
      }
    }

    // Artificial timeout.
    await new Promise(resolve => setTimeout(resolve, 500));
  },
  configOptions
);

console.log(`Worker ${worker.name} started...`);
