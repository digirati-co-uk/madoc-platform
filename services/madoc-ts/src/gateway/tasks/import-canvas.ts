import { BaseTask } from './base-task';
import * as tasks from './task-helpers';
import { iiifGetLabel } from '../../utility/iiif-get-label';
import { ApiClient } from '../api';
import { ContentResource } from '@hyperion-framework/types';

export const type = 'madoc-canvas-import';

export const status = [
  // 0 - not started
  'pending',
  // 1 - accepted
  'accepted',
  // 2 - in progress
  'in progress',
  // 3 - done
  'done',
  // 4+ custom
  // ...
] as const;

export interface ImportCanvasTask extends BaseTask {
  type: 'madoc-canvas-import';
  parameters: [number, string, string, number | undefined];
  status: -1 | 0 | 1 | 2 | 3 | 4;
  state: {
    omekaId?: number;
    errorMessage?: string;
    isDuplicate?: boolean;
    canvasOrder?: number;
    resourceId?: number;
  };
}

export function createTask(
  canvasUrl: string,
  omekaUserId: number,
  pathToManifest: string,
  manifestId: string,
  siteId?: number
): ImportCanvasTask {
  return {
    type: 'madoc-canvas-import',
    name: 'Importing canvas',
    description: `Importing canvas from url ${canvasUrl}`,
    subject: canvasUrl,
    state: {},
    events: ['madoc-ts.created'],
    status: 0,
    status_text: status[0],
    parameters: [omekaUserId, pathToManifest, manifestId, siteId],
  };
}

export function changeStatus(newStatus: string, data: { state?: any; name?: string; description?: string } = {}) {
  return tasks.changeStatus(status, newStatus, data);
}

export const jobHandler = async (name: string, taskId: string, api: ApiClient) => {
  switch (name) {
    case 'created': {
      const task = await api.acceptTask<ImportCanvasTask>(taskId, {
        omitSubtasks: true,
      });

      const [userId, pathToManifest, manifestId, siteId] = task.parameters;

      const idHash = tasks.manifestHash(manifestId);

      const { manifest, unmodifiedManifest, canvas, vault } = await tasks.tryGetManifest(
        manifestId,
        pathToManifest,
        task.subject
      );

      const idList = (manifest.items || []).map(r => r.id);
      const canvasOrder = idList.indexOf(canvas.id);
      const canvasJson = tasks.getCanvasFromManifest(unmodifiedManifest, canvas.id);

      const fileLocation = await tasks.writeCanvasToDisk(idHash, canvasJson, canvasOrder);

      const thumbnail = await tasks.getThumbnail(vault, canvas);
      const thumbId = thumbnail && thumbnail.id ? thumbnail.id : undefined;

      let retries = 3;
      let item;
      while (retries > 0) {
        let canvasToAdd: any;
        try {
          canvasToAdd = {
            id: canvas.id,
            label: canvas.label || { none: ['Untitled canvas'] },
            summary: canvas.summary || undefined,
            metadata: canvas.metadata || undefined,
            homepage: canvas.homepage ? vault.fromRef<ContentResource>(canvas.homepage) : undefined,
            logo: canvas.logo ? vault.allFromRef<ContentResource>(canvas.logo) : undefined,
            partOf: canvas.partOf ? canvas.partOf : undefined,
            rendering: canvas.rendering ? vault.allFromRef<ContentResource>(canvas.rendering) : undefined,
            seeAlso: canvas.seeAlso ? vault.allFromRef<ContentResource>(canvas.seeAlso) : undefined,
            service: canvas.service,
          } as any;
        } catch (err) {
          console.log('Could not import linking properties.');
        }
        item = await api.asUser({ userId, siteId }).createCanvas(
          canvasToAdd
            ? canvasToAdd
            : {
                id: canvas.id,
                label: canvas.label || { none: ['Untitled canvas'] },
                height: canvas.height,
                width: canvas.width,
              },
          thumbId,
          fileLocation
        );
        if (item) {
          break;
        }
        retries--;
      }

      if (!item) {
        throw new Error('Could not create canvas');
      }

      // Search ingest.
      const userApi = api.asUser({ siteId });
      if (task.state.resourceId) userApi.indexCanvas(task.state.resourceId);

      await api.updateTask(
        taskId,
        changeStatus('done', {
          name: iiifGetLabel(canvas.label),
          state: { resourceId: item.id, canvasOrder },
        })
      );
      break;
    }
  }
};
