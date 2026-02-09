import { sql } from 'slonik';
import {
  getCaptureModelDataForSearchExport,
  getManifestResourcesForSearchExport,
} from '../../database/queries/search-index-export';
import { streamManifestTypesenseDocuments } from '../../search/typesense/build-manifest-documents';
import { flattenCaptureModelFieldsByResource } from '../../search/typesense/flatten-capture-model-fields';
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

function uniq(values: string[]) {
  return [...new Set(values.map(value => value.trim()).filter(Boolean))];
}

function getResourceUrn(resourceType: 'Manifest' | 'Canvas', resourceId: number) {
  if (resourceType === 'Manifest') {
    return `urn:madoc:manifest:${resourceId}`;
  }

  return `urn:madoc:canvas:${resourceId}`;
}

export const indexManifest: RouteMiddleware<{ id: string }> = async context => {
  const { siteId, siteUrn } = optionalUserWithScope(context, []);
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

  const legacyResult = {
    skipped: true,
    reason: 'Legacy search indexing has been removed. Typesense-only indexing is active.',
  };

  if (!manifestRecord.published) {
    const warnings: string[] = [];
    const canvasIds = await context.connection.any<{ id: number }>(sql`
      select item_id as id
      from iiif_derived_resource_items
      where site_id = ${siteIdAsNumber}
        and resource_id = ${manifestId}
    `);

    const targetUrns = uniq([
      `urn:madoc:manifest:${manifestId}`,
      ...canvasIds.map(({ id }) => `urn:madoc:canvas:${id}`),
    ]);

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
        legacy: legacyResult,
        typesense: typesenseCleanup,
      },
      legacy: legacyResult,
      warnings,
    };
    return;
  }

  const warnings: string[] = [];
  let typesenseResult: any = null;
  const availability = await isTypesenseAvailable();

  if (availability.available) {
    try {
      const sqlStart = Date.now();
      const resources = await context.connection.any(getManifestResourcesForSearchExport(manifestId, siteIdAsNumber));

      if (!resources.length) {
        context.response.body = {
          noSearch: true,
          legacy: legacyResult,
          typesense: null,
          warnings,
        };
        return;
      }

      const targetUrns = resources.map(row => getResourceUrn(row.resource_type, row.resource_id));
      const captureModelRows = targetUrns.length
        ? await context.connection.any(getCaptureModelDataForSearchExport(siteIdAsNumber, targetUrns))
        : [];
      const sqlMs = Date.now() - sqlStart;

      const flattenStart = Date.now();
      const captureModelByResource = flattenCaptureModelFieldsByResource(captureModelRows);
      const captureModelMs = Date.now() - flattenStart;

      const collectionName = resolveTypesenseSearchCollection({
        siteId: siteIdAsNumber,
      });
      const typesense = new TypesenseClient();
      await typesense.ensureSearchCollection(collectionName);

      const importStart = Date.now();
      const importResult = await typesense.upsertDocumentsStream(
        collectionName,
        streamManifestTypesenseDocuments(resources, {
          siteId: siteIdAsNumber,
          siteUrn,
          captureModelByResource,
        })
      );
      const importMs = Date.now() - importStart;

      console.log(
        'Search: manifest index metrics Manifest(%d) Site(%d) docs=%d sqlMs=%d captureModelMs=%d importMs=%d',
        manifestId,
        siteIdAsNumber,
        importResult.total,
        sqlMs,
        captureModelMs,
        importMs
      );

      typesenseResult = {
        indexed: importResult.total,
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
