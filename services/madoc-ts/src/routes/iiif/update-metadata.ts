import { sql } from 'slonik';
import {
  getManifestSnippets,
  getSingleManifest,
  mapManifestSnippets,
} from '../../database/queries/get-manifest-snippets';

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
  const { siteId, siteUrn } = userWithScope(context, ['site.admin']);
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

    const manifestId = Number(context.params.id);

    const rows = await context.connection.any(
      getManifestSnippets(
        getSingleManifest({
          manifestId,
          siteId: Number(siteId),
          perPage: 1,
          page: 1,
          excludeCanvases: [],
        }),
        {
          siteId: Number(siteId),
          fields: ['label'],
          allManifestFields: true,
        }
      )
    );

    const table = mapManifestSnippets(rows);

    if (!table.manifests[`${manifestId}`]) {
      return; // no metadata to index.
    }

    const collectionsWithin = await context.connection.any<{ resource_id: number }>(
      sql`select cols.resource_id from iiif_derived_resource_items cols
        left join iiif_derived_resource ir on ir.resource_id = cols.resource_id
        where item_id = ${manifestId} and cols.site_id = ${Number(siteId)} and ir.flat = false`
    );

    const manifest = table.manifests[`${manifestId}`];
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
      contexts: [
        { id: siteUrn, type: 'Site' },
        ...collectionsWithin.map(({ resource_id }) => {
          return { id: `urn:madoc:collection:${resource_id}`, type: 'Collection' };
        }),
        {
          id: `urn:madoc:manifest:${manifestId}`,
          type: 'Manifest',
        },
      ],
    };

    try {
      await userApi.searchReIngest(searchPayload);
    } catch (e) {
      console.log(e);
    }
  }

  context.response.status = 200;
};
