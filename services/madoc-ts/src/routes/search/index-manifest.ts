import { sql } from 'slonik';
import {
  getManifestSnippets,
  getSingleManifest,
  mapManifestSnippets,
} from '../../database/queries/get-manifest-snippets';
import { getManifestResourcesForSearchExport } from '../../database/queries/search-index-export';
import { api } from '../../gateway/api.server';
import { buildManifestTypesenseDocuments } from '../../search/typesense/build-manifest-documents';
import {
  getTypesenseSiteCollectionName,
  isTypesenseSearchEnabled,
  TypesenseClient,
} from '../../search/typesense/typesense-client';
import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const indexManifest: RouteMiddleware<{ id: string }> = async context => {
  const { siteId, siteUrn } = optionalUserWithScope(context, []);
  const userApi = api.asUser({ siteId });
  const manifestId = Number(context.params.id);
  const site = await context.siteManager.getSiteById(siteId);
  const forceIndex = context.query.force === 'true';

  if (site.config.disableSearchIndexing && !forceIndex) {
    console.log('Search: indexing skipped, Manifest(%d) Site(%d)', manifestId, siteId);
    context.response.body = { noSearch: true };
    return;
  }

  if (isTypesenseSearchEnabled()) {
    const [resources, collectionsWithin, projectsWithin] = await Promise.all([
      context.connection.any(getManifestResourcesForSearchExport(manifestId, Number(siteId))),
      context.connection.any<{ resource_id: number }>(
        sql`select cols.resource_id from iiif_derived_resource_items cols
            left join iiif_derived_resource ir on ir.resource_id = cols.resource_id
            where item_id = ${manifestId} and cols.site_id = ${Number(siteId)} and ir.flat = false`
      ),
      context.connection.any<{ id: number }>(
        sql`select ip.id from iiif_derived_resource_items cols
            left join iiif_derived_resource ir on ir.resource_id = cols.resource_id
            left join iiif_project ip on ip.collection_id = ir.resource_id
            where item_id = ${manifestId} and cols.site_id = ${Number(siteId)} and ir.flat = true`
      ),
    ]);

    if (!resources.length) {
      context.response.body = { noSearch: true };
      return;
    }

    const documents = buildManifestTypesenseDocuments(resources, {
      siteId: Number(siteId),
      siteUrn,
      manifestId,
      collectionIds: collectionsWithin.map(({ resource_id }) => resource_id),
      projectIds: projectsWithin.map(({ id }) => id),
    });

    const collectionName = getTypesenseSiteCollectionName(Number(siteId));
    const typesense = new TypesenseClient();
    await typesense.ensureSearchCollection(collectionName);
    const importResult = await typesense.upsertDocuments(collectionName, documents);

    context.response.body = {
      indexed: documents.length,
      backend: 'typesense',
      collection: collectionName,
      importResult,
    };
    return;
  }

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
    context.response.body = { noSearch: true };
    return;
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

  const searchPayload = {
    id: `urn:madoc:manifest:${manifestId}`,
    type: 'Manifest',
    cascade: false,
    cascade_canvases: false,
    resource: {
      ...manifest,
      id: `http://madoc.dev/urn:madoc:manifest:${manifestId}`,
      type: 'Manifest',
    },
    thumbnail: manifest.thumbnail,
    contexts: [
      { id: siteUrn, type: 'Site' },
      ...projectsWithin.map(({ id }) => {
        return { id: `urn:madoc:project:${id}`, type: 'Project' };
      }),
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
    await api.searchGetIIIF(`urn:madoc:manifest:${manifestId}`);

    context.response.body = await userApi.searchReIngest(searchPayload);
  } catch (err) {
    context.response.body = await userApi.searchIngest(searchPayload);
  }
};
