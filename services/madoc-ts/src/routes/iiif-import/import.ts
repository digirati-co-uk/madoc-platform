// We can import
// - Collections
// - Manifests
// - Image files (to canvas)
//
// Starting with manifests.
// 1. Fetches from URL
// 2. Option to strip metadata, ranges etc.
// 3. Parses and extracts all of the canvases.
// 4. Adds a new import task
// 5. Adds manifest to import task
// 6. Adds canvases to manifest task
// 7. Adds thumbnail task to manifest task
// 8. Adds thumbnail task to fake "queue"
//
// Notes
// - Don't need to queue ingest of IIIF manifests / canvases, can be 2 inserts.
// - Queue will just be fore thumbnail generation.

import { api } from '../../gateway/api.server';
import * as manifest from '../../gateway/tasks/import-manifest';
import * as collection from '../../gateway/tasks/import-collection';
import * as manifestOcr from '../../gateway/tasks/process-manifest-ocr';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const importManifest: RouteMiddleware<never, { manifest: string }> = async (context, next) => {
  const { id, siteId, name } = userWithScope(context, ['site.admin']);

  const userApi = api.asUser({ userId: id, userName: name, siteId });

  const manifestId = context.requestBody.manifest;
  context.response.body = await userApi.newTask(manifest.createTask(manifestId, id, siteId));
};

export const importBulkManifests: RouteMiddleware<never, { manifests: string[] }> = async context => {
  const { id, siteId, name } = userWithScope(context, ['site.admin']);

  const userApi = api.asUser({ userId: id, userName: name, siteId });

  const manifests = context.requestBody.manifests;
  const rootTask = await userApi.newTask({
    type: 'madoc-manifest-import-bulk',
    name: 'Bulk import manifests',
    subject: 'none',
    parameters: [],
    state: {},
    status: 0,
    status_text: 'waiting',
    events: [],
  });
  const tasks = [];

  for (const manifestId of manifests) {
    tasks.push(manifest.createTask(manifestId, id, siteId));
  }

  await userApi.addSubtasks(tasks, rootTask.id);

  context.response.body = rootTask;
};

export const importCollection: RouteMiddleware<never, { collection: string; manifestIds: string[] }> = async (
  context,
  next
) => {
  const { id, siteId, name } = userWithScope(context, ['site.admin']);

  const userApi = api.asUser({ userId: id, userName: name, siteId });

  const collectionId = context.requestBody.collection;
  const manifests = context.requestBody.manifestIds;

  context.response.body = await userApi.newTask(collection.createTask(collectionId, id, siteId, manifests));
};

export const importManifestOcr: RouteMiddleware<never, { manifestId: number; label: string }> = async context => {
  const { id, siteId, name } = userWithScope(context, ['site.admin']);

  const userApi = api.asUser({ userId: id, userName: name, siteId });

  const manifestId = context.requestBody.manifestId;
  const label = context.requestBody.label;
  context.response.body = await userApi.newTask(manifestOcr.createTask(manifestId, label, id, siteId));
};
