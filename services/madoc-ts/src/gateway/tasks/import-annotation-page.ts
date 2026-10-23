import { BaseTask } from './base-task';
import { ApiClient } from '../api';
import { loadAnnotationPages, loadTextBodies } from '../../iiif/fetch-annotation-page';

export const type = 'madoc-annotation-page-import';
export interface ImportAnnotationPageTask extends BaseTask {
  parameters: [number, number, number, number, number];
  state: { error?: string };
}

export function createTask(
  resourceId: number,
  pageId: number,
  siteId: number,
  userId: number,
  generation: number
): ImportAnnotationPageTask {
  return {
    type,
    name: 'Import annotation page',
    subject: `urn:madoc:annotation-page:${pageId}`,
    parameters: [resourceId, pageId, siteId, userId, generation],
    state: {},
    events: ['madoc-ts.created'],
    status: 0,
    status_text: 'pending',
  };
}

export async function jobHandler(name: string, taskId: string, api: ApiClient) {
  if (name !== 'created') return;
  const task = await api.acceptTask<ImportAnnotationPageTask>(taskId);
  const [resourceId, pageId, siteId, userId, generation] = task.parameters;
  const userApi = api.asUser({ siteId, userId });
  try {
    const { pages } = await userApi.getAnnotationPages(resourceId);
    const page = pages.find(item => item.id === pageId);
    if (!page || page.properties.generation !== generation) {
      await api.updateTask(taskId, { status: 3, status_text: 'Superseded' });
      return;
    }
    const loaded =
      page.properties.mode === 'external'
        ? await loadAnnotationPages(page.uri)
        : await (async () => {
            try {
              return {
                page: page.properties.document!,
                ...(await loadTextBodies(page.properties.document!, page.uri)),
              };
            } catch (error) {
              return {
                page: page.properties.document!,
                textBodies: {},
                textError: error instanceof Error ? error.message : String(error),
              };
            }
          })();
    await userApi.completeAnnotationPage(resourceId, pageId, { ...loaded, generation });
    await api.updateTask(taskId, { status: 3, status_text: 'Imported' });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await userApi.completeAnnotationPage(resourceId, pageId, { error: message, generation });
    await api.updateTask(taskId, { status: -1, status_text: 'Could not load annotations', state: { error: message } });
  } finally {
    userApi.dispose();
  }
}
