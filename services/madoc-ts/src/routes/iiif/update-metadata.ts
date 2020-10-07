import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { MetadataUpdate } from '../../types/schemas/metadata-update';
import { userWithScope } from '../../utility/user-with-scope';
import {
  addDerivedMetadata,
  deleteDerivedMetadata,
  updateDerivedMetadata,
} from '../../database/queries/metadata-queries';

// EDIT IN THIS FILE

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
    const userApi = api.asUser({ siteId });
    await userApi.indexManifest(resourceId);

    const manifest = await api.getManifestById(resourceId);

    const contexts = await api.getManifestProjects(resourceId);

    const searchPayload = {
      id: `urn:madoc:manifest:${resourceId}`,
      type: 'Manifest',
      resource: {
        ...manifest,
        id: `http://madoc.dev/urn:madoc:manifest:${resourceId}`,
        type: 'Manifest',
        label: (manifest && manifest.manifest && manifest.manifest.label) || '',
        items: (manifest && manifest.manifest && manifest.manifest.items) || [],
      },
      thumbnail: (manifest && manifest.manifest && manifest.manifest.thumbnail) || '',
      contexts: contexts,
    };

    try {
      await userApi.searchIngest(searchPayload);
    } catch (e) {
      console.log(e);
    }
  }

  context.response.status = 200;
};
