import { sql } from 'slonik';
import {
  getManifestSnippets,
  getSingleManifest,
  mapManifestSnippets,
} from '../../database/queries/get-manifest-snippets';
import { createSearchIngest } from '../../extensions/enrichment/utilities/create-search-ingest';
import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const indexManifest: RouteMiddleware<{ id: string }> = async context => {
  const { siteId, siteUrn } = optionalUserWithScope(context, []);
  const userApi = api.asUser({ siteId });
  const manifestId = Number(context.params.id);
  const sourceId = `http://madoc.dev/urn:madoc:manifest:${manifestId}`;

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
    context.response.body = {};
    return; // no metadata to index.
  }

  const collectionsWithin = await context.connection.any<{ resource_id: number }>(
    sql`select cols.resource_id from iiif_derived_resource_items cols
        left join iiif_derived_resource ir on ir.resource_id = cols.resource_id
        where item_id = ${manifestId} and cols.site_id = ${Number(siteId)} and ir.flat = false`
  );

  const projectsWithin = await context.connection.any<{ id: number }>(
    sql`select ip.id from iiif_derived_resource_items cols
        left join iiif_derived_resource ir on ir.resource_id = cols.resource_id
        left join iiif_project ip on ip.collection_id = ir.resource_id
        where item_id = ${manifestId} and cols.site_id = ${Number(siteId)} and ir.flat = true`
  );

  const manifest = table.manifests[`${manifestId}`];

  const searchPayload = createSearchIngest(
    manifestId,
    'manifest',
    {
      id: sourceId,
      ...manifest,
    },
    siteId,
    manifest.thumbnail,
    [
      ...projectsWithin.map(({ id }) => `urn:madoc:project:${id}`),
      ...collectionsWithin.map(({ resource_id }) => `urn:madoc:collection:${resource_id}`),
    ]
  );

  await userApi.search.enrichmentIngestResource(searchPayload);

  // await userApi.search.triggerSearchIndex(manifestId, 'manifest');

  context.response.body = await userApi.search.triggerSearchIndex(manifestId, 'manifest');
  // try {
  //   await api.searchGetIIIF(`urn:madoc:manifest:${manifestId}`);
  //
  //   context.response.body = await userApi.search.searchReIngest(searchPayload);
  // } catch (err) {
  //   context.response.body = await userApi.searchIngest(searchPayload);
  // }
};
