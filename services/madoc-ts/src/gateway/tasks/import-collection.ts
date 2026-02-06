import { generateId } from '../../frontend/shared/capture-models/helpers/generate-id';
import { BaseTask } from './base-task';
import * as importManifest from './import-manifest';
import * as tasks from './task-helpers';
import { Vault } from '@iiif/helpers/vault';
import fetch from 'node-fetch';
import { ImportManifestTask } from './import-manifest';
import { iiifGetLabel } from '../../utility/iiif-get-label';
import { ApiClient } from '../api';

export const type = 'madoc-collection-import';

export const status = [
  // 0 - not started
  'pending',
  // 1 - accepted
  'accepted',
  // 2 - in progress
  'waiting for manifests',
  // 3 - done
  'done',
  // 4+ custom
  'importing manifests',
] as const;

export interface ImportCollectionTask extends BaseTask {
  type: 'madoc-collection-import';
  parameters: [number, number | undefined, string[] | undefined];
  status: -1 | 0 | 1 | 2 | 3 | 4;
  state: {
    resourceId?: number;
    manifestIds?: string[];
    errorMessage?: string;
    isDuplicate?: boolean;
  };
}

export function createTask(
  collectionUrl: string,
  userId: number,
  siteId?: number,
  manifestIds?: string[]
): ImportCollectionTask {
  return {
    type: 'madoc-collection-import',
    name: 'Importing collection',
    description: `Importing collection from url ${collectionUrl}`,
    subject: encodeURI(collectionUrl),
    state: {},
    events: [
      'madoc-ts.created',
      `madoc-ts.subtask_type_status.madoc-manifest-import.${importManifest.status.indexOf('done')}`,
    ],
    status: 0,
    status_text: status[0],
    parameters: [userId, siteId, manifestIds],
  };
}

export function changeStatus(newStatus: string, data: { state?: any; name?: string; description?: string } = {}) {
  return tasks.changeStatus(status, newStatus, data);
}

function getImportTargets(iiifCollection: any, allowedManifestIds?: string[]) {
  const targetManifestIds: string[] = [];
  const targetCollectionIds: string[] = [];
  const includeManifest =
    allowedManifestIds && allowedManifestIds.length ? new Set(allowedManifestIds.map(id => encodeURI(id))) : null;

  for (const item of iiifCollection.items || []) {
    if (!item || !item.id || !item.type) {
      continue;
    }
    const id = encodeURI(item.id);
    if (item.type === 'Manifest') {
      if (includeManifest && !includeManifest.has(id)) {
        continue;
      }
      targetManifestIds.push(id);
      continue;
    }
    if (item.type === 'Collection') {
      targetCollectionIds.push(id);
    }
  }

  return {
    targetManifestIds,
    targetCollectionIds,
  };
}

async function queueNextManifest(
  api: ApiClient,
  task: ImportCollectionTask,
  userId: number,
  siteId: number | undefined,
  manifestIds: string[]
) {
  const subtasks = (task.subtasks || []).filter(subtask => subtask.type === importManifest.type);
  const subtaskMap = new Map<string, (typeof subtasks)[number]>();
  for (const subtask of subtasks) {
    if (!subtaskMap.has(subtask.subject)) {
      subtaskMap.set(subtask.subject, subtask);
    }
  }

  for (const manifestId of manifestIds) {
    const existingManifestTask = subtaskMap.get(manifestId);
    if (existingManifestTask && existingManifestTask.status === tasks.STATUS.DONE) {
      continue;
    }

    if (existingManifestTask) {
      if (
        existingManifestTask.status === tasks.STATUS.ACCEPTED ||
        existingManifestTask.status === tasks.STATUS.IN_PROGRESS ||
        existingManifestTask.status > tasks.STATUS.DONE
      ) {
        return true;
      }

      await api.updateTask(existingManifestTask.id, importManifest.changeStatus('pending'));
      return true;
    }

    if (task.id) {
      await api.addSubtasks<ImportManifestTask>([importManifest.createTask(manifestId, userId, siteId)], task.id);
      return true;
    }
  }

  return false;
}

export const jobHandler = async (name: string, taskId: string, api: ApiClient) => {
  switch (name) {
    case 'created': {
      const vault = new Vault();
      const task = await api.acceptTask<ImportCollectionTask>(taskId);
      const [userId, siteId, manifestIds] = task.parameters;

      // 1. Fetch collection
      const json = await fetch(task.subject).then(r => r.json());
      const iiifCollection = await vault.loadCollection(task.subject, json);

      if (!iiifCollection) {
        throw new Error(`Error importing collection ${task.subject}`);
      }

      const { targetManifestIds, targetCollectionIds } = getImportTargets(iiifCollection, manifestIds);

      // 2. Post request to /api/madoc/iiif/collection (type CreateCollection)
      const response = await api.asUser({ userId, siteId }).createCollection(
        {
          id: iiifCollection.id,
          label: iiifCollection.label || undefined,
          summary: iiifCollection.summary || undefined,
        },
        task.id
      );

      const originalSubtasks = task.subtasks || [];
      const collectionsToCreate: ImportCollectionTask[] = [];
      const collectionsToReTrigger: string[] = [];
      const originalSubtasksMap = new Map<string, (typeof originalSubtasks)[number]>();

      for (const subtask of originalSubtasks) {
        if (subtask.type === importManifest.type || subtask.type === type) {
          if (!originalSubtasksMap.has(subtask.subject)) {
            originalSubtasksMap.set(subtask.subject, subtask);
          }
        }
      }

      for (const collectionRef of targetCollectionIds) {
        const originalSubtask = originalSubtasksMap.get(collectionRef);
        if (!originalSubtask) {
          collectionsToCreate.push(createTask(collectionRef, userId, siteId));
          continue;
        }
        if (originalSubtask.status !== tasks.STATUS.DONE) {
          collectionsToReTrigger.push(originalSubtask.id);
        }
      }

      console.log(
        `Adding ${collectionsToCreate.length} child collections, re-triggering ${
          collectionsToReTrigger.length
        }, manifests queued: ${targetManifestIds.length}`
      );

      if (collectionsToCreate.length && task.id) {
        await api.addSubtasks<ImportCollectionTask>(collectionsToCreate, task.id);
      }

      if (collectionsToReTrigger.length) {
        for (const subtask of collectionsToReTrigger) {
          await api.updateTask(subtask, changeStatus('pending'));
        }
      }

      const waitingOnManifest = await queueNextManifest(api, task, userId, siteId, targetManifestIds);

      // 4. If no manifests, then mark as done
      if (!waitingOnManifest && collectionsToCreate.length === 0 && collectionsToReTrigger.length === 0) {
        await api.updateTask(task.id, changeStatus('done'));
        return;
      }

      // 5. Set task to waiting for manifests
      await api.updateTask(
        task.id,
        changeStatus('waiting for manifests', {
          name: iiifGetLabel(iiifCollection.label),
          state: {
            resourceId: response.id,
            manifestIds: targetManifestIds,
          },
        })
      );
      break;
    }
    case `subtask_type_status.${importManifest.type}.${tasks.STATUS.DONE}`: {
      // 1. Update with manifest ids from sub tasks
      const task = await api.getTaskById<ImportCollectionTask>(taskId);
      const subtasks = task.subtasks || [];
      const [userId, siteId, requestedManifestIds] = task.parameters;

      if (!task.state.resourceId) {
        return;
      }

      let manifestIds = task.state.manifestIds || [];
      if (!manifestIds.length) {
        const vault = new Vault();
        const json = await fetch(task.subject).then(r => r.json());
        const iiifCollection = await vault.loadCollection(task.subject, json);

        if (!iiifCollection) {
          throw new Error(`Error loading IIIF collection ${task.subject}`);
        }

        manifestIds = getImportTargets(iiifCollection, requestedManifestIds).targetManifestIds;
      }

      const waitingOnManifest = await queueNextManifest(api, task, userId, siteId, manifestIds);
      if (waitingOnManifest) {
        return;
      }

      const idMap: { [id: string]: number } = {};
      for (const subtask of subtasks) {
        if (subtask.type === importManifest.type) {
          idMap[subtask.subject] = subtask.state.resourceId;
        }
      }
      const manifestResourceIds = manifestIds.map(id => idMap[id]).filter(e => e);

      const userApi = await api.asUser({ siteId, userId });

      // 4. Save structure of collection
      await userApi.updateCollectionStructure(task.state.resourceId, manifestResourceIds);

      // 5. Update the task.
      await api.updateTask(taskId, changeStatus('done'));

      // 5.1
      if (siteId) {
        const site = await userApi.getSiteDetails(siteId);
        if (site.config.autoPublishImport) {
          await userApi.publishCollection(task.state.resourceId);
        }
      }

      // 6. Notify user.
      if (!task.parent_task) {
        await userApi.notifications.createNotification({
          id: generateId(),
          title: 'Finished importing collection',
          summary: task.subject,
          action: {
            id: 'task:admin',
            link: `urn:madoc:task:${taskId}`,
          },
          user: userId,
        });
      }

      break;
    }
  }
};
