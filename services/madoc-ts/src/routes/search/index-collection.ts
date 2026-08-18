import { sql } from 'slonik';
import { getCollectionResourceForSearchExport } from '../../database/queries/search-index-export';
import { buildManifestTypesenseDocument } from '../../search/typesense/build-manifest-documents';
import {
  isTypesenseAvailable,
  isTypesenseSearchEnabled,
  resolveTypesenseSearchCollection,
  TypesenseClient,
} from '../../search/typesense/typesense-client';
import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope } from '../../utility/user-with-scope';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Unknown error';
}

export const indexCollection: RouteMiddleware<{ id: string }> = async context => {
  const { siteId, siteUrn } = optionalUserWithScope(context, []);
  const siteIdAsNumber = Number(siteId);
  const collectionId = Number(context.params.id);
  const collectionUrn = `urn:madoc:collection:${collectionId}`;
  const site = await context.siteManager.getSiteById(siteId);
  const forceIndex = context.query.force === 'true';

  if (site.config.disableSearchIndexing && !forceIndex) {
    context.response.body = { noSearch: true };
    return;
  }

  const collection = await context.connection.maybeOne<{ published: boolean; flat: boolean }>(sql`
    select published, flat
    from iiif_derived_resource
    where site_id = ${siteIdAsNumber}
      and resource_type = 'collection'
      and resource_id = ${collectionId}
    limit 1
  `);
  const availability = await isTypesenseAvailable();
  const collectionName = resolveTypesenseSearchCollection({ siteId: siteIdAsNumber });

  if (!collection || !collection.published || collection.flat) {
    if (availability.available) {
      const typesense = new TypesenseClient();
      await typesense.deleteDocument(collectionName, `${collectionUrn}:site:${siteIdAsNumber}`, { allow404: true });
    }
    context.response.body = {
      noSearch: true,
      reason: !collection
        ? 'Collection does not exist'
        : collection.flat
          ? 'Project collections are not indexed'
          : 'Collection is not published',
    };
    return;
  }

  if (!availability.available) {
    context.response.body = {
      collection: { id: collectionId },
      typesense: null,
      warnings: isTypesenseSearchEnabled() ? [availability.reason || 'Typesense is unavailable'] : [],
    };
    return;
  }

  try {
    const resource = await context.connection.maybeOne(
      getCollectionResourceForSearchExport(collectionId, siteIdAsNumber)
    );
    if (!resource) {
      context.response.body = { noSearch: true };
      return;
    }

    const typesense = new TypesenseClient();
    await typesense.ensureSearchCollection(collectionName);
    const importResult = await typesense.upsertDocumentsStream(collectionName, [
      buildManifestTypesenseDocument(resource, { siteId: siteIdAsNumber, siteUrn }),
    ]);

    context.response.body = {
      collection: { id: collectionId },
      typesense: { indexed: importResult.total, collection: collectionName, importResult },
      warnings: [],
    };
  } catch (error) {
    context.response.body = {
      collection: { id: collectionId },
      typesense: null,
      warnings: [`Typesense indexing failed: ${getErrorMessage(error)}`],
    };
  }
};
