import { config } from '../../config';
import { createPostgresPool } from '../../database/create-postgres-pool';
import {
  FullSearchReindexResourceType,
  getFullSearchReindexResources,
} from '../../database/queries/full-search-reindex';
import {
  isTypesenseAvailable,
  resolveTypesenseSearchCollection,
  TypesenseClient,
} from '../../search/typesense/typesense-client';
import { ApiClient } from '../api';
import { BaseTask } from './base-task';
import { createTask as createSearchIndexTask, type as searchIndexTaskType } from './search-index-task';

export const type = 'full-reindex';

const BATCH_SIZE = 200;
const RESOURCE_TYPES: FullSearchReindexResourceType[] = ['manifest', 'collection', 'project'];

let postgres: ReturnType<typeof createPostgresPool> | undefined;

export interface FullReindexTask extends BaseTask {
  type: 'full-reindex';
  parameters: [number];
  status: -1 | 0 | 1 | 2 | 3;
  state: {
    dispatchComplete: boolean;
    queuedResources: number;
  };
}

export function createTask(siteId: number): FullReindexTask {
  return {
    type,
    name: 'Full search reindex',
    subject: `urn:madoc:site:${siteId}`,
    parameters: [siteId],
    events: ['madoc-ts.created', `madoc-ts.subtask_type_status.${searchIndexTaskType}.3`],
    status: 0,
    status_text: 'pending',
    state: {
      dispatchComplete: false,
      queuedResources: 0,
    },
  };
}

export function hasFinishedDispatch(statuses: Record<string, number>, total: number) {
  return total === 0 || Object.entries(statuses).every(([status, count]) => count === 0 || status === '3');
}

async function completeIfFinished(api: ApiClient, taskId: string) {
  const task = await api.getTask<FullReindexTask>(taskId);
  if (!task.state.dispatchComplete) {
    return;
  }

  const stats = await api.getTaskStats(taskId, { type: searchIndexTaskType });
  if (hasFinishedDispatch(stats.statuses, stats.total)) {
    await api.updateTask(taskId, { status: 3, status_text: `Indexed ${task.state.queuedResources} resources` });
  }
}

async function clearTypesenseSite(siteId: number) {
  if (!(await isTypesenseAvailable()).available) {
    return;
  }

  try {
    const collectionName = resolveTypesenseSearchCollection({ siteId });
    const typesense = new TypesenseClient();
    await typesense.ensureSearchCollection(collectionName);
    await typesense.deleteByFilter(collectionName, `site_id:=${siteId}`);
  } catch {
    // Best effort cleanup. The queued reindex tasks will still recreate documents.
  }
}

async function dispatchSearchTasks(api: ApiClient, taskId: string, siteId: number) {
  postgres ||= createPostgresPool(config.postgres);
  let queuedResources = 0;

  for (const resourceType of RESOURCE_TYPES) {
    let afterId = 0;

    while (true) {
      const resources = await getFullSearchReindexResources(postgres, siteId, resourceType, afterId, BATCH_SIZE);
      if (!resources.length) {
        break;
      }

      await api.addSubtasks([createSearchIndexTask(resources, siteId, { recursive: false })], taskId);
      queuedResources += resources.length;
      afterId = resources[resources.length - 1].id;
    }
  }

  return queuedResources;
}

export const jobHandler = async (name: string, taskId: string, api: ApiClient) => {
  switch (name) {
    case 'created': {
      const task = await api.acceptTask<FullReindexTask>(taskId);
      const [siteId] = task.parameters;
      await api.updateTask(taskId, { status: 2, status_text: 'Queueing resources' });
      await clearTypesenseSite(siteId);
      const queuedResources = await dispatchSearchTasks(api, taskId, siteId);
      await api.updateTask(taskId, {
        status: 2,
        status_text: `Indexing ${queuedResources} resources`,
        state: { dispatchComplete: true, queuedResources },
      });
      await completeIfFinished(api, taskId);
      break;
    }

    case `subtask_type_status.${searchIndexTaskType}.3`:
      await completeIfFinished(api, taskId);
      break;
  }
};
