import { BaseTask } from './base-task';
import * as tasks from './task-helpers';
import { CanvasNormalized, ManifestNormalized } from '@hyperion-framework/types';
import { iiifGetLabel } from '../../utility/iiif-get-label';
import { ApiClient } from '../api';

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

export function changeStatus<K extends any>(
  newStatus: typeof status[K] | 'error',
  data: { state?: any; name?: string; description?: string } = {}
) {
  return tasks.changeStatus(status, newStatus, data);
}

export const jobHandler = async (name: string, taskId: string, api: ApiClient) => {
  switch (name) {
    case 'created': {
      const task = await api.acceptTask<ImportCanvasTask>(taskId);

      const [userId, pathToManifest, manifestId, siteId] = task.parameters;
      const [manifestJson, unmodifiedManifest] = tasks.loadManifest(pathToManifest);

      const vault = tasks.sharedVault(manifestId);

      await tasks.ensureManifestLoaded(vault, manifestId, manifestJson);

      const manifest = vault.fromRef<ManifestNormalized>({ id: manifestId, type: 'Manifest' });

      const ref: { id: string; type: 'Canvas' } = { id: task.subject, type: 'Canvas' };
      // @todo handle case where canvas does not exist.
      const canvas = vault.fromRef<CanvasNormalized>(ref);

      if (canvas === ref) {
        console.log(manifestId, JSON.stringify(manifestJson));
        throw new Error('Could not load manifest from vault.');
      }

      const idHash = tasks.manifestHash(manifestId);

      const idList = (manifest.items || []).map(r => r.id);
      const canvasOrder = idList.indexOf(canvas.id);
      const canvasJson = tasks.getCanvasFromManifest(unmodifiedManifest, canvas.id);

      const fileLocation = await tasks.writeCanvasToDisk(idHash, canvasJson, canvasOrder);

      const thumbnail = await tasks.getThumbnail(vault, canvas);
      const thumbId = thumbnail && thumbnail.id ? thumbnail.id : undefined;

      let retries = 3;
      let item;
      while (retries > 0) {
        item = await api.asUser({ userId, siteId }).createCanvas(
          {
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
