import { generateId } from '@capture-models/helpers';
import { BaseTask } from './base-task';
import { CrowdsourcingReview } from './crowdsourcing-review';
import * as importCanvas from './import-canvas';
import * as manifestOcr from './process-manifest-ocr';
import { createTask as createSearchIndexTask } from './search-index-task';
import * as tasks from './task-helpers';
import { Vault } from '@hyperion-framework/vault';
import fetch from 'node-fetch';
import { ImportCanvasTask } from './import-canvas';
import { iiifGetLabel } from '../../utility/iiif-get-label';
import { ApiClient } from '../api';
import { ContentResource } from '@hyperion-framework/types';

export const type = 'madoc-manifest-import';

export const status = [
  // 0 - not started
  'pending',
  // 1 - accepted
  'accepted',
  // 2 - in progress
  'waiting for canvases',
  // 3 - done
  'done',
  // 4+ custom
  'importing canvases',
] as const;

export interface ImportManifestTask extends BaseTask {
  type: 'madoc-manifest-import';
  parameters: [number, number | undefined];
  status: -1 | 0 | 1 | 2 | 3 | 4;
  state: {
    resourceId?: number;
    errorMessage?: string;
    isDuplicate?: boolean;
  };
}

export function createTask(manifestUrl: string, userId: number, siteId?: number): ImportManifestTask {
  return {
    type: 'madoc-manifest-import',
    name: 'Importing manifest',
    description: `Importing manifest from url ${manifestUrl}`,
    subject: encodeURI(manifestUrl),
    state: {},
    events: [
      'madoc-ts.created',
      `madoc-ts.subtask_type_status.madoc-canvas-import.${importCanvas.status.indexOf('done')}`,
    ],
    status: 0,
    status_text: status[0],
    parameters: [userId, siteId],
  };
}

export function changeStatus(newStatus: string, data: { state?: any; name?: string; description?: string } = {}) {
  return tasks.changeStatus(status, newStatus, data);
}

export function errorMessage(message: string) {
  return changeStatus('error' as any, { state: { errorMessage: message } });
}

export const jobHandler = async (name: string, taskId: string, api: ApiClient) => {
  switch (name) {
    case 'created': {
      const vault = new Vault();
      const task = await api.acceptTask<ImportManifestTask>(taskId);
      const [userId, siteId] = task.parameters;

      // 1. Fetch manifest
      const text = await fetch(task.subject).then(r => r.text());
      const json = JSON.parse(text);
      const iiifManifest = await vault.loadManifest(task.subject, json);

      if (!iiifManifest) {
        throw new Error(`Error loading manifest ${task.subject}`);
      }

      const idHash = tasks.manifestHash(iiifManifest.id);

      // 2. Save manifest to disk, IF it does not already exist.
      const fileLocation = tasks.saveManifestToDisk(idHash, text);

      // 3. POST request to `/api/madoc/iiif/manifests`
      let retries = 3;
      let item;
      while (retries > 0) {
        let manifestToAdd: any;
        try {
          manifestToAdd = {
            id: iiifManifest.id,
            label: iiifManifest.label || { none: ['Untitled Manifest'] },
            summary: iiifManifest.summary || undefined,
            metadata: iiifManifest.metadata || undefined,
            requiredStatement: iiifManifest.requiredStatement || undefined,
            viewingDirection: iiifManifest.viewingDirection || undefined,
            behavior: iiifManifest.behavior || undefined,
            rights: iiifManifest?.rights || undefined,
            navDate: iiifManifest?.navDate || undefined,
            homepage: iiifManifest.homepage ? vault.fromRef<ContentResource>(iiifManifest.homepage) : undefined,
            logo: iiifManifest.logo ? vault.allFromRef<ContentResource>(iiifManifest.logo) : undefined,
            partOf: iiifManifest.partOf ? iiifManifest.partOf : undefined,
            rendering: iiifManifest.rendering ? vault.allFromRef<ContentResource>(iiifManifest.rendering) : undefined,
            seeAlso: iiifManifest.seeAlso ? vault.allFromRef<ContentResource>(iiifManifest.seeAlso) : undefined,
            service: iiifManifest.service,
            services: iiifManifest.services,
            start: iiifManifest.start ? vault.fromRef(iiifManifest.start) : undefined,
          } as any;
        } catch (err) {
          console.log(err);
          console.log('Could not import linking properties.');
        }
        item = await api.asUser({ userId, siteId }).createManifest(
          manifestToAdd
            ? manifestToAdd
            : {
                id: iiifManifest.id,
                label: iiifManifest.label || { none: ['Untitled Manifest'] },
                summary: iiifManifest.summary || undefined,
                metadata: iiifManifest.metadata || undefined,
                requiredStatement: iiifManifest.requiredStatement || undefined,
                viewingDirection: iiifManifest.viewingDirection || undefined,
                behavior: iiifManifest.behavior || undefined,
                rights: iiifManifest?.rights || undefined,
                navDate: iiifManifest?.navDate || undefined,
              },
          fileLocation,
          task.id
        );
        if (item) {
          break;
        }
        retries--;
      }

      if (!item) {
        throw new Error('Could not save manifest');
      }

      // 4. MAYBE add thumbnail - todo later
      // 5. Add subtasks for canvases (if the subtasks do not exist)
      const subtasks: ImportCanvasTask[] = [];
      const originalSubtasks = task.subtasks || [];
      const subtasksToReTrigger = [];
      const subjectsToSkip = [];

      if (originalSubtasks.length) {
        for (const subtask of originalSubtasks) {
          if (subtask.type === importCanvas.type) {
            if (subtask.status !== 3) {
              subtasksToReTrigger.push(subtask.id);
            }
            subjectsToSkip.push(subtask.subject);
          }
        }
      }
      // Just add them all.
      for (const canvasRef of iiifManifest.items) {
        if (canvasRef.type === 'Canvas') {
          if (subjectsToSkip.indexOf(canvasRef.id) !== -1) {
            continue;
          }
          subtasks.push(importCanvas.createTask(canvasRef.id, userId, fileLocation, iiifManifest.id, siteId));
        }
      }

      console.log(
        `Adding ${subtasks.length} canvases, re-triggering ${
          subtasksToReTrigger.length
        }, skipping ${subjectsToSkip.length - subtasksToReTrigger.length}`
      );

      if (subtasks.length && task.id) {
        await api.addSubtasks(subtasks, task.id);
      }

      if (subtasksToReTrigger.length) {
        for (const subtask of subtasksToReTrigger) {
          await api.updateTask(subtask, changeStatus('pending'));
        }
      }

      // 6. Mark as done if no canvases
      if (subtasks.length === 0 && subtasksToReTrigger.length === 0) {
        await api.updateTask(task.id, changeStatus('done'));
        return;
      }

      // 7. Mark manifest as waiting for canvases
      await api.updateTask(
        task.id,
        changeStatus('waiting for canvases', {
          name: iiifGetLabel(iiifManifest.label),
          state: { resourceId: item.id, isDuplicate: false },
        })
      );

      break;
    }
    case `subtask_type_status.${importCanvas.type}.${tasks.STATUS.DONE}`: {
      // 0. Set task to processing manifests
      // 1. Update with manifest ids from sub tasks
      const task = await api.getTaskById<ImportManifestTask>(taskId);
      const [userId, siteId] = task.parameters;
      const subtasks = task.subtasks || [];

      if (!task.state.resourceId) {
        return;
      }

      const resourceId = task.state.resourceId;
      if (!resourceId) {
        await api.updateTask(taskId, errorMessage('Resource ID not found, import unsuccessful'));
        return;
      }

      const orderedSubtasks = subtasks.sort(function(a, b) {
        return a.state.canvasOrder - b.state.canvasOrder;
      });

      if (orderedSubtasks.length) {
        // Grab the canvas ids in order.
        const canvasIds = orderedSubtasks.map(subtask => subtask.state.resourceId);

        // Update canvases.
        await api.asUser({ userId, siteId }).updateManifestStructure(task.state.resourceId, canvasIds);
      }

      // Search ingest.
      const site = siteId ? await api.asUser({ userId, siteId }).getSiteDetails(siteId) : undefined;
      const userApi = api.asUser(
        { siteId, userId },
        {
          siteSlug: site ? site.slug : undefined,
        }
      );

      if (siteId) {
        // Also available through the API:
        // await userApi.batchIndexResources([{ type: 'manifest', id: task.state.resourceId }], { recursive: true });
        await userApi.newTask(
          createSearchIndexTask([{ type: 'manifest', id: task.state.resourceId }], siteId, { recursive: true }),
          taskId
        );
      }

      // Update task.
      await api.updateTask(taskId, changeStatus('done'));
      if (!task.parent_task) {
        await userApi.notifications.createNotification({
          id: generateId(),
          title: 'Finished importing manifest',
          summary: task.subject,
          action: {
            id: 'task:admin',
            link: `urn:madoc:task:${taskId}`,
          },
          user: userId,
        });
      }

      // Queue up OCR extraction.
      try {
        const config = await userApi.getSiteConfiguration();
        if (!config.skipAutomaticOCRImport) {
          await userApi.newTask(
            manifestOcr.createTask(task.state.resourceId, `${task.state.resourceId}`, userId, siteId as number),
            taskId
          );
        }
      } catch (err) {
        // no-op.
        console.log(err);
      }
      break;
    }
  }
};
