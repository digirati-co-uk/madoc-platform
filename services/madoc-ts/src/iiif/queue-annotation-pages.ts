import { ApiClientWithoutExtensions } from '../gateway/api';
import { createTask } from '../gateway/tasks/import-annotation-page';
import { AnnotationPageRecord } from './types';

export async function enqueueAnnotationPages(
  api: ApiClientWithoutExtensions,
  pages: readonly AnnotationPageRecord[],
  siteId: number,
  userId: number
) {
  const results = await Promise.allSettled(
    pages.map(page => api.newTask(createTask(page.resource_id, page.id, siteId, userId, page.properties.generation)))
  );
  const failure = results.find(result => result.status === 'rejected');
  if (failure?.status === 'rejected') throw failure.reason;
}
