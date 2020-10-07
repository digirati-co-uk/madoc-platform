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

    console.log(contexts);

    const resource = {
      id: resourceId.toString(),
      thumbnail: manifest.manifest.thumbnail || '',
      // how do I map here to the right shape for the resource
      resource: { ...manifest.manifest, type: resourceId.toString(), id: resourceId.toString() },
      contexts: { contexts },
    };

    userApi.searchReIngest(resource);
  }

  context.response.status = 200;
};
