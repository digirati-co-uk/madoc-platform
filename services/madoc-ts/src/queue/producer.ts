import { Worker, WorkerOptions } from 'bullmq';
import * as manifest from '../gateway/tasks/import-manifest';
import * as collection from '../gateway/tasks/import-collection';
import * as canvas from '../gateway/tasks/import-canvas';
import * as crowdsourcing from '../gateway/tasks/crowdsourcing-task';
import * as review from '../gateway/tasks/crowdsourcing-review';
import { api } from '../gateway/api.server';
import * as tasks from '../gateway/tasks/task-helpers';
import * as crowdsourcingCanvas from '../gateway/tasks/crowdsourcing-canvas-task';
import * as crowdsourcingManifest from '../gateway/tasks/crowdsourcing-manifest-task';
import * as processManifestOcr from '../gateway/tasks/process-manifest-ocr';
import * as processCanvasOcr from '../gateway/tasks/process-canvas-ocr';
import * as searchIndex from '../gateway/tasks/search-index-task';
import * as apiActionTask from '../gateway/tasks/api-action-task';

const configOptions: WorkerOptions = {
  connection: {
    host: process.env.REDIS_HOST,
    db: 2,
  },
  concurrency: 2,
};

function getSiteId(context: string[]) {
  if (!context || !Array.isArray(context)) {
    return undefined;
  }
  const regex = /urn:madoc:(.*):(.*)/g;
  for (const ctx of context) {
    const result = regex.exec(ctx);
    if (!result) {
      continue;
    }

    const [, type, id] = result;

    if (type === 'site') {
      return Number(id);
    }
  }
}

const worker = new Worker(
  'madoc-ts',
  async job => {
    let contextualApi = api;

    if (job.data && job.data.context) {
      const siteId = getSiteId(job.data.context);
      if (siteId) {
        contextualApi = api.asUser({ siteId }, {}, true);
      }
    }

    console.log('starting job...', job.id, job.data ? job.data.taskId : undefined);

    try {
      switch (job.data.type) {
        case collection.type:
          return await collection.jobHandler(job.name, job.data.taskId, contextualApi).catch(err => {
            throw err;
          });
        case manifest.type:
          return await manifest.jobHandler(job.name, job.data.taskId, contextualApi).catch(err => {
            throw err;
          });
        case canvas.type:
          return await canvas.jobHandler(job.name, job.data.taskId, contextualApi).catch(err => {
            throw err;
          });
        case crowdsourcing.type:
          return await crowdsourcing.jobHandler(job.name, job.data.taskId, contextualApi).catch(err => {
            throw err;
          });
        case review.type:
          return await review.jobHandler(job.name, job.data.taskId, contextualApi).catch(err => {
            throw err;
          });
        case crowdsourcingCanvas.type:
          return await crowdsourcingCanvas.jobHandler(job.name, job.data.taskId, contextualApi).catch(err => {
            throw err;
          });
        case crowdsourcingManifest.type:
          return await crowdsourcingManifest
            .jobHandler(job.name, job.data.taskId, contextualApi, job.data)
            .catch(err => {
              throw err;
            });
        case processManifestOcr.type:
          return await processManifestOcr.jobHandler(job.name, job.data.taskId, contextualApi).catch(err => {
            throw err;
          });
        case processCanvasOcr.type:
          return await processCanvasOcr.jobHandler(job.name, job.data.taskId, contextualApi).catch(err => {
            throw err;
          });
        case searchIndex.type:
          return await searchIndex.jobHandler(job.name, job.data.taskId, contextualApi).catch(err => {
            throw err;
          });
        case apiActionTask.type:
          return await apiActionTask.jobHandler(job.name, job.data.taskId, contextualApi).catch(err => {
            throw err;
          });
      }
    } catch (e) {
      if (e && e.status && e.status === 404) {
        return;
      }

      console.log(e);
      if (job.data.taskId) {
        try {
          await contextualApi.updateTask(
            job.data.taskId,
            tasks.changeStatus([], 'error', {
              state: { error: e.toString() },
            })
          );
        } catch (err) {
          // no-op
        }
      }
      throw e;
    }
  },
  configOptions
);

console.log(`Worker ${worker.name} started...`);
