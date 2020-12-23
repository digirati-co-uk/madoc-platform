import { PARAGRAPHS_PROFILE } from '../../extensions/capture-models/Paragraphs/Paragraphs.helpers';
import { BaseTask } from './base-task';
import * as tasks from './task-helpers';
import { ApiClient } from '../api';

export const type = 'canvas-ocr-manifest';

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
  type: 'canvas-ocr-manifest';
  parameters: [number, number, number, string, 'alto' | 'hocr' | 'plain-text'];
  status: -1 | 0 | 1 | 2 | 3;
  state: {
    link_id?: number;
    error?: string;
  };
}

export function createTask(
  canvasId: number,
  label: string,
  siteId: number,
  userId: number,
  link: string,
  ocrType: 'alto' | 'hocr' | 'plain-text'
): ProcessManifestOcr {
  return {
    type: 'canvas-ocr-manifest',
    name: `Canvas OCR ${label} (${canvasId})`,
    description: `Processing existing OCR for canvas ${label}`,
    subject: `urn:madoc:canvas:${canvasId}`,
    state: {},
    events: ['madoc-ts.created'],
    status: 0,
    status_text: status[0],
    parameters: [canvasId, siteId, userId, link, ocrType],
  };
}

function createLinkedResource({
  url,
  canvasId,
  source,
  file,
  bucket = `canvas-ocr`,
}: {
  url: string;
  canvasId: string;
  source: string;
  file: string;
  bucket?: string;
}) {
  return {
    link: {
      id: url,
      format: 'application/json',
      type: 'CaptureModelDocument',
      label: 'OCR Capture model data',
      profile: PARAGRAPHS_PROFILE,
      file_path: file,
      file_bucket: bucket,
    },
    resource_id: canvasId as any,
    property: 'seeAlso',
    source,
    label: 'OCR Capture model data',
  };
}

export const jobHandler = async (name: string, taskId: string, api: ApiClient) => {
  switch (name) {
    case 'created': {
      // The task at hand.
      const task = await api.getTask<ProcessManifestOcr>(taskId);

      const [canvasId, siteId, userId, link, ocrType] = task.parameters;
      const userApi = api.asUser({ siteId, userId });

      // 1. Load all of the linking for the canvas.
      const linking = await userApi.getCanvasLinking(canvasId);

      // 2. Find if this process has already been done.
      const found = linking.linking.find(singleLink => {
        return (
          singleLink.property === 'seeAlso' &&
          singleLink.source === link &&
          singleLink.link.type === 'CaptureModelDocument'
        );
      });

      // 3. If yes - mark as done
      if (found) {
        await api.updateTask(task.id, {
          status: 3,
          status_text: 'Already exists',
        });
        return;
      }

      try {
        switch (ocrType) {
          case 'hocr': {
            // 4. Load external hOCR
            const data = await fetch(link).then(r => r.text());

            // 5. Call out to OKRA
            const converted = await userApi.convertHOCRToCaptureModel(data);

            // 6. Save to storage api
            await userApi.saveStorageJson(`canvas-ocr`, `${canvasId}/hocr`, converted, true);
            const details = await userApi.getStorageJsonDetails(`canvas-ocr`, `${canvasId}/hocr`, true);

            if (!details.public) {
              await api.updateTask(task.id, {
                status: -1,
                status_text: 'Error saving JSON',
              });
              return;
            }

            // 7. Save link to linking properties for canvas
            const addedLink = await userApi.addLinkToResource(
              createLinkedResource({
                canvasId: canvasId as any,
                url: details.public_url,
                source: link,
                bucket: 'canvas-ocr',
                file: `public/${canvasId}/hocr.json`,
              })
            );

            // 8. Mark task as done.
            await api.updateTask(task.id, {
              status: 3,
              status_text: 'Imported',
              state: {
                link_id: addedLink.id,
              },
            });

            break;
          }
          case 'alto': {
            // 4. Load external XML
            const data = await fetch(link).then(r => r.text());

            // 5. Call out to OKRA
            const converted = await userApi.convertAltoToCaptureModel(data);

            // 6. Save to storage api
            await userApi.saveStorageJson(`canvas-ocr`, `${canvasId}/mets-alto`, converted, true);
            const details = await userApi.getStorageJsonDetails(`canvas-ocr`, `${canvasId}/mets-alto`, true);

            if (!details.public) {
              await api.updateTask(task.id, {
                status: -1,
                status_text: 'Error saving JSON',
              });
              return;
            }

            // 7. Save link to linking properties for canvas
            const addedLink = await userApi.addLinkToResource(
              createLinkedResource({
                canvasId: canvasId as any,
                url: details.public_url,
                source: link,
                bucket: 'canvas-ocr',
                file: `public/${canvasId}/mets-alto.json`,
              })
            );

            // 8. Mark task as done.
            await api.updateTask(task.id, {
              status: 3,
              status_text: 'Imported',
              state: {
                link_id: addedLink.id,
              },
            });

            // Queue for re-index after adding the OCR.
            await api.indexCanvas(canvasId);

            break;
          }
          case 'plain-text': {
            // Is it an ID.
            const linkId = Number(link);

            if (!linkId || Number.isNaN(linkId)) {
              throw new Error('OCR link is not a valid identifier for plain text resource');
            }

            // Load the text.
            const addedLink = await userApi.convertLinkingProperty(linkId);

            await api.updateTask(task.id, {
              status: 3,
              status_text: 'Imported',
              state: {
                link_id: addedLink.link.id,
              },
            });

            break;
          }
          default:
            throw Error();
        }
      } catch (err) {
        console.log(err);
        await api.updateTask(task.id, {
          status: -1,
          status_text: `Could not load external OCR`,
          state: { error: `${err}` },
        });
        if (task.parent_task) {
          await api.updateTask(task.parent_task, {
            status: -1,
            status_text: `Could not load some OCR materials`,
          });
        }
        return;
      }

      break;
    }
    case `subtask_type_status.madoc-ocr-canvas.${tasks.STATUS.DONE}`: {
      // When they're all done, mark this task as done - I think that's all?

      break;
    }
  }
};
