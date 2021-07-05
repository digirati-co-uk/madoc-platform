import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { MetadataUpdate } from '../../types/schemas/metadata-update';
import { userWithScope } from '../../utility/user-with-scope';
import {
  addDerivedMetadata,
  deleteDerivedMetadata,
  updateDerivedMetadata,
} from '../../database/queries/metadata-queries';

export const updateMetadata: RouteMiddleware<{ id: number }, MetadataUpdate> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const resourceId = context.params.id;

  const { added, modified, removed } = context.requestBody;

  await context.connection.transaction(async connection => {
    const addedQuery = addDerivedMetadata(added, resourceId, siteId);
    const updatedQuery = updateDerivedMetadata(modified, resourceId, siteId);
    const removedQuery = deleteDerivedMetadata(removed, resourceId, siteId);

    if (addedQuery) {
      await connection.query(addedQuery);
    }
    if (updatedQuery) {
      await connection.query(updatedQuery);
    }
    if (removedQuery) {
      await connection.query(removedQuery);
    }
  });

  if (context.request.originalUrl.indexOf('iiif/manifests') !== -1) {
    try {
      const userApi = api.asUser({ siteId });
      userApi.indexManifest(resourceId);
      userApi.postUniversalChangeToStreams({
        id: resourceId,
        type: 'manifest',
        summary: `Manifest metadata changes`,
      });
    } catch (e) {
      console.log(e);
    }
  }

  if (context.request.originalUrl.indexOf('iiif/canvases') !== -1) {
    try {
      const userApi = api.asUser({ siteId });
      userApi.indexCanvas(resourceId);
      userApi.postUniversalChangeToStreams({
        id: resourceId,
        type: 'canvas',
        summary: `Canvas metadata changes`,
      });
    } catch (e) {
      console.log(e);
    }
  }

  if (context.request.originalUrl.indexOf('iiif/collections') !== -1) {
    const userApi = api.asUser({ siteId });
    userApi.postUniversalChangeToStreams({
      id: resourceId,
      type: 'collection',
      summary: `Collection metadata changes`,
    });
  }

  context.response.status = 200;
};
