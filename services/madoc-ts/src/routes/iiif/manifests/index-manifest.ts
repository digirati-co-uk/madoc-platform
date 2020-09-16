import { sql } from 'slonik';
import {
  getManifestSnippets,
  getSingleManifest,
  mapManifestSnippets,
} from '../../../database/queries/get-manifest-snippets';
import { api } from '../../../gateway/api.server';
import { RouteMiddleware } from '../../../types/route-middleware';
import { ApiError } from '../../../utility/errors/api-error';
import { optionalUserWithScope } from '../../../utility/user-with-scope';

export const indexManifest: RouteMiddleware<{ id: string }> = async context => {
  const { id, siteId, siteUrn } = optionalUserWithScope(context, []);
  const userApi = api.asUser({ siteId });
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
    id: `urn:madoc:manifest:${manifestId}`,
    type: 'Manifest',
    resource: {
      ...manifest,
      id: `http://madoc.dev/urn:madoc:manifest:${manifestId}`,
      type: 'Manifest',
    },
    thumbnail: manifest.thumbnail,
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

  console.log(JSON.stringify(searchPayload, null, 2));

  try {
    await userApi.searchIngest(searchPayload);
  } catch (e) {
    console.log(e);
  }

  context.response.body = table.manifests[`${manifestId}`];
};
