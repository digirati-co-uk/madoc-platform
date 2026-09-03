import { generateId } from '../../frontend/shared/capture-models/helpers/generate-id';
import { BaseTask } from './base-task';
import * as importManifest from './import-manifest';
import * as tasks from './task-helpers';
import { Vault } from '@iiif/helpers/vault';
import { ImportManifestTask } from './import-manifest';
import { iiifGetLabel } from '../../utility/iiif-get-label';
import { ApiClient } from '../api';
import { fetchIiifResource } from './fetch-iiif-resource';
import { getManifestImportChanges, getManifestImportResult } from './collection-import-helpers';
import type { ManifestImportResult } from './collection-import-helpers';

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
    skipFailedManifests?: boolean;
    skippedManifestIds?: string[];
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
      'madoc-ts.subtask_type_status.madoc-manifest-import.-1',
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

async function completeCollectionImport(
  api: ApiClient,
  task: ImportCollectionTask & { id: string },
  result: ManifestImportResult
) {
  const [userId, siteId] = task.parameters;
  const userApi = api.asUser({ siteId, userId });

  await userApi.updateCollectionStructure(task.state.resourceId as number, result.resourceIds);
  await api.updateTask(task.id, {
    ...changeStatus('done', { state: { skippedManifestIds: result.skippedManifestIds } }),
    status_text: result.skippedManifestIds.length ? 'done with skipped manifests' : status[tasks.STATUS.DONE],
  });

  if (siteId) {
    const site = await userApi.getSiteDetails(siteId);
    if (site.config.autoPublishImport) {
      await userApi.publishCollection(task.state.resourceId as number);
    }
  }

  if (!task.parent_task) {
    await userApi.notifications.createNotification({
      id: generateId(),
      title: 'Finished importing collection',
      summary: task.subject,
      action: {
        id: 'task:admin',
        link: `urn:madoc:task:${task.id}`,
      },
      user: userId,
    });
  }
}

export const jobHandler = async (name: string, taskId: string, api: ApiClient) => {
  switch (name) {
    case 'created': {
      const vault = new Vault();
      const task = await api.acceptTask<ImportCollectionTask>(taskId);
      const [userId, siteId, manifestIds] = task.parameters;

      // Explicit recovery must not depend on the source collection still being available.
      if (task.state.skipFailedManifests && task.state.resourceId && task.state.manifestIds) {
        const result = getManifestImportResult(task.subtasks || [], task.state.manifestIds, true);
        if (result) {
          await completeCollectionImport(api, task as ImportCollectionTask & { id: string }, result);
          return;
        }
      }

      // 1. Fetch collection
      const json = JSON.parse(await fetchIiifResource(task.subject));
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

      // Store the expected structure before children are queued so an immediately completed child can finalize it.
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

      if (collectionsToCreate.length && task.id) {
        await api.addSubtasks<ImportCollectionTask>(collectionsToCreate, task.id);
      }

      if (collectionsToReTrigger.length) {
        for (const subtask of collectionsToReTrigger) {
          await api.updateTask(subtask, changeStatus('pending'));
        }
      }

      const { manifestIdsToCreate, taskIdsToRetry } = getManifestImportChanges(
        task.subtasks || [],
        targetManifestIds,
        !task.state.skipFailedManifests
      );

      if (manifestIdsToCreate.length && task.id) {
        await api.addSubtasks<ImportManifestTask>(
          manifestIdsToCreate.map(manifestId => importManifest.createTask(manifestId, userId, siteId)),
          task.id
        );
      }

      if (taskIdsToRetry.length) {
        await Promise.all(
          taskIdsToRetry.map(subtaskId => api.updateTask(subtaskId, importManifest.changeStatus('pending')))
        );
      }

      if (task.state.skipFailedManifests && task.id) {
        const result = getManifestImportResult(task.subtasks || [], targetManifestIds, true);
        if (result) {
          await completeCollectionImport(
            api,
            {
              ...task,
              id: task.id,
              state: { ...task.state, resourceId: response.id, manifestIds: targetManifestIds },
            },
            result
          );
          return;
        }
      }

      // 4. If no manifests, then mark as done
      if (targetManifestIds.length === 0 && collectionsToCreate.length === 0 && collectionsToReTrigger.length === 0) {
        await api.updateTask(task.id, changeStatus('done'));
        return;
      }
      break;
    }
    case `subtask_type_status.${importManifest.type}.${tasks.STATUS.DONE}`:
    case `subtask_type_status.${importManifest.type}.-1`: {
      // 1. Update with manifest ids from sub tasks
      const task = await api.getTaskById<ImportCollectionTask>(taskId);
      const [, , requestedManifestIds] = task.parameters;

      if (!task.state.resourceId) {
        return;
      }

      let manifestIds = task.state.manifestIds || [];
      if (!manifestIds.length) {
        const vault = new Vault();
        const json = JSON.parse(await fetchIiifResource(task.subject));
        const iiifCollection = await vault.loadCollection(task.subject, json);

        if (!iiifCollection) {
          throw new Error(`Error loading IIIF collection ${task.subject}`);
        }

        manifestIds = getImportTargets(iiifCollection, requestedManifestIds).targetManifestIds;
      }

      const result = getManifestImportResult(task.subtasks || [], manifestIds, task.state.skipFailedManifests);
      if (!result) {
        return;
      }

      await completeCollectionImport(api, task, result);

      break;
    }
  }
};
