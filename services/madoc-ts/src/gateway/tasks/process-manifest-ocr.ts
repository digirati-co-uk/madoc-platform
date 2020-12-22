import { BaseTask } from './base-task';
import * as importCanvas from './import-canvas';
import * as tasks from './task-helpers';
import { ApiClient } from '../api';
import * as processCanvasOcr from './process-canvas-ocr';

export const type = 'madoc-ocr-manifest';

export const status = [
  // 0 - not started
  'pending',
  // 1 - accepted
  'accepted',
  // 2 - in progress
  'in progress',
  // 3 - done
  'done',
] as const;

export interface ProcessManifestOcr extends BaseTask {
  type: 'madoc-ocr-manifest';
  parameters: [number, number, number];
  status: -1 | 0 | 1 | 2 | 3;
  state: {};
}

export function createTask(manifestId: number, label: string, userId: number, siteId: number): ProcessManifestOcr {
  return {
    type: 'madoc-ocr-manifest',
    name: 'Manifest OCR processing',
    description: `Processing existing OCR for manifest ${label}`,
    subject: `urn:madoc:manifest:${manifestId}`,
    state: {},
    events: [
      'madoc-ts.created',
      `madoc-ts.subtask_type_status.madoc-ocr-canvas.${importCanvas.status.indexOf('done')}`,
    ],
    status: 0,
    status_text: status[0],
    parameters: [manifestId, siteId, userId],
  };
}

export const jobHandler = async (name: string, taskId: string, api: ApiClient) => {
  switch (name) {
    case 'created': {
      // The task at hand.
      const task = await api.getTask<ProcessManifestOcr>(taskId);

      const [manifestId, siteId, userId] = task.parameters;
      const userApi = api.asUser({ siteId, userId });

      // - Load the manifest links
      const links = await userApi.getManifestCanvasLinking(manifestId, {
        property: 'seeAlso',
      });

      const spendIds = [];
      const subTasks: BaseTask[] = [];
      for (const link of links.linking) {
        if (spendIds.indexOf(link.resource_id) !== -1) {
          continue;
        }
        if (
          (link.link.format === 'text/xml' || link.link.format === 'application/xml+alto') &&
          link.link.profile &&
          link.link.profile.startsWith('http://www.loc.gov/standards/alto/')
        ) {
          // Make sure we don't add it twice.
          spendIds.push(link.resource_id);
          // Create task.
          subTasks.push(
            processCanvasOcr.createTask(
              link.resource_id,
              `Alto import for canvas ID: ${link.resource_id}`,
              siteId,
              userId,
              link.file ? api.resolveUrl(link.link.id) : link.link.id,
              'alto'
            )
          );
        }

        if (
          link.link.format === 'text/vnd.hocr+html' &&
          link.link.profile &&
          (link.link.profile.startsWith('http://kba.cloud/hocr-spec') ||
            link.link.profile.startsWith('http://kba.github.io/hocr-spec/') ||
            link.link.profile === 'https://github.com/kba/hocr-spec/blob/master/hocr-spec.md')
        ) {
          // Make sure we don't add it twice.
          spendIds.push(link.resource_id);
          // Create task.
          subTasks.push(
            processCanvasOcr.createTask(
              link.resource_id,
              `hOCR import for canvas ID: ${link.resource_id}`,
              siteId,
              userId,
              link.file ? api.resolveUrl(link.link.id) : link.link.id,
              'hocr'
            )
          );
        }
      }

      if (subTasks.length) {
        await api.addSubtasks(subTasks, taskId);
      } else {
        // Set task as done - with no items.
        await api.updateTask(taskId, {
          status: 3,
          status_text: 'No items to process',
        });
      }

      break;
    }
    case `subtask_type_status.madoc-ocr-canvas.${tasks.STATUS.DONE}`: {
      // When they're all done, mark this task as done - I think that's all?
      await api.updateTask(taskId, {
        status: 3,
        status_text: 'done',
      });
      break;
    }
  }
};
