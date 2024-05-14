import { optionalUserWithScope } from '../../../utility/user-with-scope';
import { CollectionFull } from '../../../types/schemas/collection-full';
import { RouteMiddleware } from '../../../types/route-middleware';
import {
  getCollectionSnippets,
  getSingleCollection,
  mapCollectionSnippets,
} from '../../../database/queries/get-collection-snippets';
import { getResourceCount } from '../../../database/queries/count-queries';

export const getCollection: RouteMiddleware<{ id: number }> = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.view']);
  const collectionId = Number(context.params.id);

  const manifestsPerPage = 24;
  const excludeManifests = context.query.excluded;
  let excluded = Array.isArray(excludeManifests)
    ? excludeManifests
    : excludeManifests
      ? excludeManifests.split(',')
      : undefined;

  if (context.requestBody && context.requestBody.excluded) {
    excluded = Array.isArray(context.requestBody.excluded)
      ? context.requestBody.excluded
      : context.requestBody.excluded.split(',');
  }

  const { total = 0 } = (await context.connection.maybeOne(getResourceCount(collectionId, siteId))) || { total: 0 };
  const adjustedTotal = excluded ? total - excluded.length : total;
  const totalPages = Math.ceil(adjustedTotal / manifestsPerPage) || 1;
  const requestedPage = Number(context.query.page) || 1;
  const page = requestedPage < totalPages ? requestedPage : totalPages;
  const type = adjustedTotal === 0 ? undefined : context.query.type || undefined;

  const rows = await context.connection.any(
    getCollectionSnippets(
      getSingleCollection({
        collectionId,
        siteId: Number(siteId),
        perPage: manifestsPerPage,
        page,
        type,
        excludeManifests: excluded,
      }),
      {
        siteId: Number(siteId),
        // fields: ['label'],
        allCollectionFields: true,
      }
    )
  );

  const table = mapCollectionSnippets(rows);

  const totals = await context.connection.any(getResourceCount([collectionId], siteId));

  const totalsIdMap = totals.reduce(
    (state, row) => {
      state[row.resource_id] = row.total;
      return state;
    },
    {} as { [id: string]: number }
  );

  const returnCollections = [];
  const collection = table.collections[`${collectionId}`] || {
    id: collectionId,
    label: { none: ['Collection not found'] },
    source: 'not-found',
  };
  const manifestIds = table.collection_to_manifest[`${collectionId}`] || [];
  collection.items = manifestIds.map((id: number) => table.manifests[id]);
  collection.itemCount = totalsIdMap[collectionId] || 0;
  returnCollections.push(collection);

  context.response.body = {
    collection,
    pagination: {
      page,
      totalResults: adjustedTotal,
      totalPages,
    },
  } as CollectionFull;
};
