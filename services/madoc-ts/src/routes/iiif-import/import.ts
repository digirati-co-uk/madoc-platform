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

export const importManifest: RouteMiddleware<{}, { manifest: string }> = async (context, next) => {
  if (!context.state.jwt || !context.state.jwt.user.id) {
    context.response.status = 404;
    return;
  }
  const manifestId = context.requestBody.manifest;
  context.response.body = await api.newTask(
    manifest.createTask(manifestId, context.state.jwt.user.id, context.state.jwt.site.id),
    undefined,
    context.state.jwt.token
  );
};

export const importCollection: RouteMiddleware<{}, { collection: string }> = async (context, next) => {
  if (!context.state.jwt || !context.state.jwt.user.id) {
    context.response.status = 404;
    return;
  }
  const collectionId = context.requestBody.collection;
  context.response.body = await api.newTask(
    collection.createTask(collectionId, context.state.jwt.user.id, context.state.jwt.site.id),
    undefined,
    context.state.jwt.token
  );
};

export const importManifestOcr: RouteMiddleware<{}, { manifestId: number; label: string }> = async context => {
  if (!context.state.jwt || !context.state.jwt.user.id) {
    context.response.status = 404;
    return;
  }
  const manifestId = context.requestBody.manifestId;
  const label = context.requestBody.label;
  context.response.body = await api.newTask(
    manifestOcr.createTask(manifestId, label, context.state.jwt.user.id, context.state.jwt.site.id),
    undefined,
    context.state.jwt.token
  );
};
