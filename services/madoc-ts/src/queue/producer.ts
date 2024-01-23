import { Job, Worker, WorkerOptions } from 'bullmq';
import { ApiClient } from '../gateway/api';
import * as manifest from '../gateway/tasks/import-manifest';
import * as collection from '../gateway/tasks/import-collection';
import * as canvas from '../gateway/tasks/import-canvas';
import * as crowdsourcing from '../gateway/tasks/crowdsourcing-task';
import * as review from '../gateway/tasks/crowdsourcing-review';
import { api } from '../gateway/api.server';
import * as crowdsourcingCanvas from '../gateway/tasks/crowdsourcing-canvas-task';
import * as crowdsourcingManifest from '../gateway/tasks/crowdsourcing-manifest-task';
import * as processManifestOcr from '../gateway/tasks/process-manifest-ocr';
import * as processCanvasOcr from '../gateway/tasks/process-canvas-ocr';
import * as searchIndex from '../gateway/tasks/search-index-task';
import * as apiActionTask from '../gateway/tasks/api-action-task';
import * as migrationTasks from '../capture-model-server/migration/migrate-model-task';
import * as exportResource from '../gateway/tasks/export-resource-task';

const configOptions: WorkerOptions = {
  connection: {
    host: process.env.REDIS_HOST,
    db: 2,
  },
  concurrency: 20,
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
    let contextualApi: ApiClient = api;
    let isContextual = false;

    if (job.data && job.data.context) {
      const siteId = getSiteId(job.data.context);
      if (siteId) {
        isContextual = true;
        contextualApi = api.asUser({ siteId }, {}, true);
      }
    }

    // Waiting for response from ping.
    // The worker runs multiple tasks at once. It may be possible to share this waiting across multiple tasks
    // to avoid the calls to /api/madoc. But since it's only hitting nginx, it shouldn't be a problem.
    let isWaiting = true;
    while (isWaiting) {
      try {
        await api.request('/api/madoc');
        isWaiting = false;
      } catch (e) {
        console.log('Waiting for Madoc to come online...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('starting job...', job.id, job.data ? job.data.taskId : undefined);

    // @todo with the addition of automation - this will need to be changed so we can fetch the Task before handing
    //   it to the job handler. Every single handler already fetches the task, so this shouldn't be a problem
    //   The handlers can be changed quickly. We can also change this slightly messy code to work better.
    //   The remaining questions will be:
    //       - Should we only fetch the user if there is a supported automation?
    //       - Should we fetch the assignee details and pass to every job handler?

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
        case migrationTasks.type:
          return await migrationTasks.jobHandler(job.name, job.data.taskId, contextualApi).catch(err => {
            throw err;
          });
        case exportResource.type:
          return await exportResource.jobHandler(job.name, job.data.taskId, contextualApi).catch(err => {
            throw err;
          });

        default:
          // No our task.
          return true;
      }
    } catch (e: any) {
      console.log('failed', job.data.type, e && e.status, e && e.message);
      console.log(e);
      if (e && e.status && e.status === 404) {
        return true;
      }

      if (job.data.taskId) {
        try {
          // Leave this for now, the retry should be working.
          // await contextualApi.updateTask(job.data.taskId, { status: 0, status_text: 'Failed, retrying...' });
        } catch (err) {
          // no-op
        }
      }
      throw e;
    } finally {
      if (isContextual && contextualApi) {
        contextualApi.dispose();
      }
    }
  },
  configOptions
);

worker.on('failed', async (job: Job) => {
  // job has failed
  if (job.data && job.data.taskId) {
    let contextualApi;

    if (job.data.context) {
      const siteId = getSiteId(job.data.context);
      if (siteId) {
        contextualApi = api.asUser({ siteId }, {}, true);
      }
    }

    await (contextualApi || api).updateTask(job.data.taskId, { status: -1, status_text: 'Failed' });

    if (contextualApi) {
      contextualApi.dispose();
    }
  }
});

console.log(`Worker ${worker.name} started...`);
