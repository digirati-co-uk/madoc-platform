import { sql } from 'slonik';
import {
  getCanvasResourceForSearchExport,
  getCaptureModelDataForSearchExport,
} from '../../database/queries/search-index-export';
import { buildManifestTypesenseDocument } from '../../search/typesense/build-manifest-documents';
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

export const indexCanvas: RouteMiddleware<{ id: string }> = async context => {
  const { siteId, siteUrn } = optionalUserWithScope(context, []);
  const siteIdAsNumber = Number(siteId);
  const canvasId = Number(context.params.id);
  const canvasUrn = `urn:madoc:canvas:${canvasId}`;
  const site = await context.siteManager.getSiteById(siteId);
  const forceIndex = context.query.force === 'true';

  if (site.config.disableSearchIndexing && !forceIndex) {
    console.log('Search: indexing skipped, Canvas(%d) Site(%d)', canvasId, siteId);
    context.response.body = { noSearch: true };
    return;
  }

  const canvasExists = await context.connection.maybeOne<{ id: number }>(sql`
    select id
    from iiif_resource
    where id = ${canvasId}
      and type = 'canvas'
    limit 1
  `);

  if (!canvasExists) {
    context.response.body = {
      noSearch: true,
      reason: 'Canvas does not exist',
    };
    return;
  }

  const legacyResult = {
    skipped: true,
    reason: 'Legacy search indexing has been removed. Typesense-only indexing is active.',
  };

  const resource = await context.connection.maybeOne(getCanvasResourceForSearchExport(canvasId, siteIdAsNumber));

  if (!resource || !resource.manifest_ids.length) {
    const warnings: string[] = [];
    let typesenseCleanup: any = null;

    if (isTypesenseSearchEnabled()) {
      const availability = await isTypesenseAvailable();
      if (availability.available) {
        try {
          const collectionName = resolveTypesenseSearchCollection({
            siteId: siteIdAsNumber,
          });
          const typesense = new TypesenseClient();
          await typesense.deleteDocument(collectionName, `${canvasUrn}:site:${siteIdAsNumber}`, { allow404: true });
          typesenseCleanup = {
            deleted: 1,
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
      reason: 'Canvas is not in a published manifest',
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
      const captureModelRows = await context.connection.any(getCaptureModelDataForSearchExport(siteIdAsNumber, [canvasUrn]));
      const sqlMs = Date.now() - sqlStart;

      const flattenStart = Date.now();
      const captureModelByResource = flattenCaptureModelFieldsByResource(captureModelRows);
      const captureModelMs = Date.now() - flattenStart;

      const typesenseDocument = buildManifestTypesenseDocument(resource, {
        siteId: siteIdAsNumber,
        siteUrn,
        captureModelByResource,
      });

      const collectionName = resolveTypesenseSearchCollection({
        siteId: siteIdAsNumber,
      });

      const typesense = new TypesenseClient();
      await typesense.ensureSearchCollection(collectionName);

      const importStart = Date.now();
      const importResult = await typesense.upsertDocumentsStream(collectionName, [typesenseDocument]);
      const importMs = Date.now() - importStart;

      console.log(
        'Search: canvas index metrics Canvas(%d) Site(%d) docs=%d sqlMs=%d captureModelMs=%d importMs=%d',
        canvasId,
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
    canvas: { id: canvasId },
    legacy: legacyResult,
    typesense: typesenseResult,
    warnings,
  };
};
