import { Worker, WorkerOptions } from 'bullmq';
import * as manifest from '../gateway/tasks/import-manifest';
import * as collection from '../gateway/tasks/import-collection';
import * as canvas from '../gateway/tasks/import-canvas';
import { api } from '../gateway/api.server';
import * as tasks from '../gateway/tasks/task-helpers';

const configOptions: WorkerOptions = {
  connection: {
    host: process.env.REDIS_HOST,
    db: 2,
  },
  concurrency: 2,
};

const worker = new Worker(
  'madoc-ts',
  async job => {
    console.log('starting job..', job.id);
    try {
      switch (job.data.type) {
        case collection.type:
          return await collection.jobHandler(job.name, job.data.taskId, api).catch(err => {
            throw err;
          });
        case manifest.type:
          return await manifest.jobHandler(job.name, job.data.taskId, api).catch(err => {
            throw err;
          });
        case canvas.type:
          return await canvas.jobHandler(job.name, job.data.taskId, api).catch(err => {
            throw err;
          });
      }
    } catch (e) {
      if (job.data.taskId) {
        await api.updateTask(
          job.data.taskId,
          tasks.changeStatus([], 'error', {
            state: { error: e.toString() },
          })
        );
      }
      console.log(e);
      await job.retry('failed');
    }
  },
  configOptions
);

console.log(`Worker ${worker.name} started...`);
