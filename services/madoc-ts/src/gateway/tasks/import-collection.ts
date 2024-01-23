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

      // 2. Post request to /api/madoc/iiif/collection (type CreateCollection)
      const response = await api.asUser({ userId, siteId }).createCollection(
        {
          id: iiifCollection.id,
          label: iiifCollection.label || undefined,
          summary: iiifCollection.summary || undefined,
        },
        task.id
      );

      const subtasks: Array<ImportManifestTask | ImportCollectionTask> = [];
      const originalSubtasks = task.subtasks || [];
      const subtasksToReTrigger = [];
      const subjectsToSkip = [];

      if (originalSubtasks.length) {
        for (const subtask of originalSubtasks) {
          if (subtask.type === importManifest.type || subtask.type === type) {
            if (subtask.status !== 3) {
              subtasksToReTrigger.push(subtask.id);
            }
            subjectsToSkip.push(subtask.subject);
          }
        }
      }
      for (const manifestRef of iiifCollection.items) {
        if (manifestIds && manifestIds.length) {
          if (manifestIds?.indexOf(manifestRef.id) === -1) {
            continue;
          }
        }
        if (subjectsToSkip.indexOf(manifestRef.id) !== -1) {
          continue;
        }
        if (manifestRef.type === 'Manifest') {
          subtasks.push(importManifest.createTask(manifestRef.id, userId, siteId));
        }
        if (manifestRef.type === 'Collection') {
          subtasks.push(createTask(manifestRef.id, userId, siteId));
        }
      }

      console.log(
        `Adding ${subtasks.length} canvases, re-triggering ${
          subtasksToReTrigger.length
        }, skipping ${subjectsToSkip.length - subtasksToReTrigger.length}`
      );

      if (subtasks.length && task.id) {
        await api.addSubtasks<ImportManifestTask | ImportCollectionTask>(subtasks, task.id);
      }

      if (subtasksToReTrigger.length) {
        for (const subtask of subtasksToReTrigger) {
          await api.updateTask(subtask, changeStatus('pending'));
        }
      }

      // 4. If no manifests, then mark as done
      if (subtasks.length === 0 && subtasksToReTrigger.length === 0) {
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
          },
        })
      );
      break;
    }
    case `subtask_type_status.${importManifest.type}.${tasks.STATUS.DONE}`: {
      // 1. Update with manifest ids from sub tasks
      const vault = new Vault();
      const task = await api.getTaskById<ImportCollectionTask>(taskId);
      const subtasks = task.subtasks || [];
      const [userId, siteId] = task.parameters;

      if (!task.state.resourceId) {
        return;
      }

      // 2. Fetch collection
      const json = await fetch(task.subject).then(r => r.json());
      const iiifCollection = await vault.loadCollection(task.subject, json);

      if (!iiifCollection) {
        throw new Error(`Error loading IIIF collection ${task.subject}`);
      }

      // 3. Get the manifests in order.
      const manifestIds = iiifCollection.items.map(r => r.id);
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
