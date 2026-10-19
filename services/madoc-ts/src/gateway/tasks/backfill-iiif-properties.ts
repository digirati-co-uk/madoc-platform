import { BaseTask } from './base-task';
import { ApiClient, ApiClientWithoutExtensions } from '../api';
import { fetchAnnotationResource } from '../../iiif/fetch-annotation-page';
import { presentation3, object, extraProperties, identifier } from '../../iiif/properties';
import { JsonObject } from '../../iiif/types';

export const type = 'madoc-iiif-properties-backfill';
interface BackfillTask extends BaseTask {
  parameters: [number, number, number];
}
export function createTask(resourceId: number, source: string, siteId: number, userId: number): BackfillTask {
  return {
    type,
    name: 'Restore imported IIIF properties',
    subject: source,
    parameters: [resourceId, siteId, userId],
    state: {},
    events: ['madoc-ts.created'],
    status: 0,
    status_text: 'pending',
  };
}
export async function jobHandler(name: string, taskId: string, api: ApiClient) {
  if (name !== 'created') return;
  const task = await api.acceptTask<BackfillTask>(taskId);
  const [resourceId, siteId, userId] = task.parameters;
  const userApi = api.asUser({ siteId, userId });
  try {
    await restoreIIIFProperties(userApi, resourceId, task.subject);
    await api.updateTask(taskId, { status: 3, status_text: 'Properties restored; remote pages queued' });
  } finally {
    userApi.dispose();
  }
}

export async function restoreIIIFProperties(api: ApiClientWithoutExtensions, resourceId: number, source: string) {
  const resource: unknown = JSON.parse(await fetchAnnotationResource(source, 100 * 1024 * 1024));
  if (!object(resource)) throw new Error('Invalid IIIF resource');
  await api.importIIIFProperties(resourceId, restorationProperties(presentation3(resource)), true);
}

export function restorationProperties(resource: JsonObject): JsonObject {
  const properties = (input: JsonObject): JsonObject => ({
    ...extraProperties(input),
    id: identifier(input),
    type: input.type,
    annotations: input.annotations,
  });
  return {
    ...properties(resource),
    // Painting bodies and managed metadata already have storage; keep this request small.
    ...(Array.isArray(resource.items) ? { items: resource.items.filter(object).map(properties) } : {}),
  };
}
