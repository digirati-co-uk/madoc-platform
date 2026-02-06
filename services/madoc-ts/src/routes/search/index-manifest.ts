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
  isTypesenseAvailable,
  isTypesenseSearchEnabled,
  resolveTypesenseSearchCollection,
  TypesenseClient,
} from '../../search/typesense/typesense-client';
import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope } from '../../utility/user-with-scope';

function getErrorMessage(err: unknown) {
  if (err instanceof Error) {
    return err.message;
  }
  return 'Unknown error';
}

function getManifestResourceUrns(manifestId: number, canvasIds: number[]) {
  const targets = [`urn:madoc:manifest:${manifestId}`, ...canvasIds.map(canvasId => `urn:madoc:canvas:${canvasId}`)];
  return [...new Set(targets)];
}

export const indexManifest: RouteMiddleware<{ id: string }> = async context => {
  const { siteId, siteUrn } = optionalUserWithScope(context, []);
  const userApi = api.asUser({ siteId });
  const siteIdAsNumber = Number(siteId);
  const manifestId = Number(context.params.id);
  const site = await context.siteManager.getSiteById(siteId);
  const forceIndex = context.query.force === 'true';

  if (site.config.disableSearchIndexing && !forceIndex) {
    console.log('Search: indexing skipped, Manifest(%d) Site(%d)', manifestId, siteId);
    context.response.body = { noSearch: true };
    return;
  }

  const manifestRecord = await context.connection.maybeOne<{ published: boolean }>(sql`
    select published
    from iiif_derived_resource
    where site_id = ${siteIdAsNumber}
      and resource_type = 'manifest'
      and resource_id = ${manifestId}
    limit 1
  `);

  if (!manifestRecord) {
    context.response.body = { noSearch: true };
    return;
  }

  if (!manifestRecord.published) {
    const warnings: string[] = [];
    let targetUrns = getManifestResourceUrns(manifestId, []);
    try {
      const manifestStructure = await userApi.getManifestStructure(manifestId);
      targetUrns = getManifestResourceUrns(
        manifestId,
        Array.isArray(manifestStructure?.items) ? manifestStructure.items.map(item => item.id) : []
      );
    } catch (err) {
      warnings.push(`Unable to resolve canvas list for cleanup: ${getErrorMessage(err)}`);
    }

    let legacyCleanup: any = null;
    try {
      for (const targetUrn of targetUrns) {
        await userApi.searchDeleteIIIF(targetUrn);
      }
      legacyCleanup = {
        deleted: targetUrns.length,
      };
    } catch (err) {
      warnings.push(`Legacy cleanup failed: ${getErrorMessage(err)}`);
    }

    let typesenseCleanup: any = null;
    if (isTypesenseSearchEnabled()) {
      const availability = await isTypesenseAvailable();
      if (availability.available) {
        try {
          const collectionName = resolveTypesenseSearchCollection({
            siteId: siteIdAsNumber,
          });
          const typesense = new TypesenseClient();
          for (const targetUrn of targetUrns) {
            await typesense.deleteDocument(collectionName, `${targetUrn}:site:${siteIdAsNumber}`, { allow404: true });
          }
          typesenseCleanup = {
            deleted: targetUrns.length,
            collection: collectionName,
          };
        } catch (err) {
          warnings.push(`Typesense cleanup failed: ${getErrorMessage(err)}`);
        }
      } else {
        warnings.push(availability.reason || 'Typesense is unavailable');
      }
    }

    context.response.body = {
      noSearch: true,
      reason: 'Manifest is not published',
      cleanup: {
        legacy: legacyCleanup,
        typesense: typesenseCleanup,
      },
      warnings,
    };
    return;
  }

  const rows = await context.connection.any(
    getManifestSnippets(
      getSingleManifest({
        manifestId,
        siteId: siteIdAsNumber,
        perPage: 1,
        page: 1,
        excludeCanvases: [],
      }),
      {
        siteId: siteIdAsNumber,
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
        where item_id = ${manifestId} and cols.site_id = ${siteIdAsNumber} and ir.flat = false`
  );

  const projectsWithin = await context.connection.any<{ id: number }>(
    sql`select ip.id from iiif_derived_resource_items cols
        left join iiif_derived_resource ir on ir.resource_id = cols.resource_id
        left join iiif_project ip on ip.collection_id = ir.resource_id
        where item_id = ${manifestId} and cols.site_id = ${siteIdAsNumber} and ir.flat = true`
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

  const legacyIndexingDisabled = isTypesenseSearchEnabled();
  let legacyResult: any = {
    skipped: true,
    reason: 'Legacy search indexing is disabled while Typesense indexing is enabled',
  };

  if (!legacyIndexingDisabled) {
    try {
      await api.searchGetIIIF(`urn:madoc:manifest:${manifestId}`);
      legacyResult = await userApi.searchReIngest(searchPayload);
    } catch (err) {
      legacyResult = await userApi.searchIngest(searchPayload);
    }
  }

  const warnings: string[] = [];
  let typesenseResult: any = null;
  const availability = await isTypesenseAvailable();
  if (availability.available) {
    try {
      const resources = await context.connection.any(getManifestResourcesForSearchExport(manifestId, siteIdAsNumber));
      const documents = buildManifestTypesenseDocuments(resources, {
        siteId: siteIdAsNumber,
        siteUrn,
        manifestId,
        collectionIds: collectionsWithin.map(({ resource_id }) => resource_id),
        projectIds: projectsWithin.map(({ id }) => id),
      });
      const collectionName = resolveTypesenseSearchCollection({
        siteId: siteIdAsNumber,
      });
      const typesense = new TypesenseClient();
      await typesense.ensureSearchCollection(collectionName);
      const importResult = await typesense.upsertDocuments(collectionName, documents);

      typesenseResult = {
        indexed: documents.length,
        collection: collectionName,
        importResult,
      };
    } catch (err) {
      warnings.push(`Typesense indexing failed: ${getErrorMessage(err)}`);
    }
  } else if (isTypesenseSearchEnabled()) {
    warnings.push(availability.reason || 'Typesense is unavailable');
  }

  context.response.body = {
    legacy: legacyResult,
    typesense: typesenseResult,
    warnings,
  };
};
