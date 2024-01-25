import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { RequestError } from '../../utility/errors/request-error';
import { optionalUserWithScope } from '../../utility/user-with-scope';

// This should be called when a collection, manifest or canvas has been changed, and all
// activity streams should be notified that the resource has changed. Changes include:
//  - Metadata
//  - Linking properties (not implemented)
//  - Structural changes
const typeMap = {
  manifest: 'Manifest',
  canvas: 'Canvas',
  collection: 'Collection',
} as const;

export const postUniversalChange: RouteMiddleware<
  unknown,
  { type: 'collection' | 'manifest' | 'canvas'; id: string; summary?: string }
> = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.admin']);
  const req = context.requestBody;
  const id = Number(req.id);
  const evType = typeMap[req.type];

  if (!id || Number.isNaN(id) || !evType) {
    throw new RequestError();
  }

  const userApi = api.asUser({ siteId });

  // Streams that need to be updated.
  const streams = await context.changeDiscovery.lastActionsForAllStreamsFromResource(id, req.type, siteId);

  const resource =
    evType === 'Collection'
      ? (await userApi.getCollectionById(id)).collection
      : evType === 'Manifest'
        ? (await userApi.getManifestById(id)).manifest
        : evType === 'Canvas'
          ? (await userApi.getCanvasById(id)).canvas
          : undefined;

  const label = resource ? (Object.values(resource.label)[0] || [])[0] : undefined;

  // Add Update event to each.
  for (const stream of streams) {
    try {
      await context.changeDiscovery.addActivity(
        'Update',
        { primaryStream: stream.primary_stream, secondaryStream: stream.secondary_stream },
        {
          summary: req.summary || `Resource was updated`,
          object: {
            id: stream.object_id,
            type: typeMap[req.type],
            name: label ? label : undefined,
            canonical: `urn:madoc:${req.type}:${id}`,
          },
        },
        siteId
      );
    } catch (e) {
      // Although not ideal, it's not the end of the world if these are no updated.
    }
  }
};
