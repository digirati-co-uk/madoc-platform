import { sql } from 'slonik';
import { api } from '../../../gateway/api.server';
import { RouteMiddleware } from '../../../types/route-middleware';
import { userWithScope } from '../../../utility/user-with-scope';

export const publishCollection: RouteMiddleware = async context => {
  const { id, siteId } = userWithScope(context, ['site.admin']);
  const { isPublished = true } = context.requestBody;
  const collectionId = Number(context.params.id);

  const siteApi = api.asUser({ userId: id, siteId });

  if (isPublished) {
    // Publish.
    await context.connection.query(sql`
      update iiif_derived_resource set published = true where resource_id = ${collectionId} and resource_type = 'collection' and site_id = ${siteId}
    `);
  } else {
    // Unpublish.
    await context.connection.query(sql`
      update iiif_derived_resource set published = false where resource_id = ${collectionId} and resource_type = 'collection' and site_id = ${siteId}
    `);
  }

  const manifestsAndCollections = await context.connection.any(sql<{ id: number; type: string }>`
      select item_id as id, ir.type as type from iiif_derived_resource_items 
        left join iiif_resource ir on ir.id = iiif_derived_resource_items.item_id
      where resource_id=${collectionId} and site_id = ${siteId}
  `);

  for (const manifestOrCollection of manifestsAndCollections) {
    if (manifestOrCollection.type === 'manifest') {
      await siteApi.publishManifest(manifestOrCollection.id, isPublished);
    }
    if (manifestOrCollection.type === 'collection') {
      // Unsupported for now - no loop protection.
    }
  }

  context.response.status = 200;
};
