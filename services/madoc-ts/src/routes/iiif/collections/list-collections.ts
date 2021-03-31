import { castBool } from '../../../utility/cast-bool';
import { optionalUserWithScope } from '../../../utility/user-with-scope';
import { CollectionListResponse } from '../../../types/schemas/collection-list';
import { RouteMiddleware } from '../../../types/route-middleware';
import {
  getCollectionList,
  getCollectionSnippets,
  mapCollectionSnippets,
} from '../../../database/queries/get-collection-snippets';
import { countResources } from '../../../database/queries/resource-queries';
import { getResourceCount } from '../../../database/queries/count-queries';

export const listCollections: RouteMiddleware<{ page: number }> = async context => {
  const { siteId } = optionalUserWithScope(context, []);
  const parent = context.query.parent ? Number(context.query.parent) : undefined;

  const collectionCount = 5;
  const page = Number(context.query.page) || 1;
  const onlyPublished = context.query.published ? castBool(context.query.published) : false;
  const { total = 0 } = await context.connection.one(
    countResources({
      resource_type: 'collection',
      site_id: siteId,
      parent_id: parent,
      onlyPublished,
    })
  );
  const totalPages = Math.ceil(total / collectionCount);

  const rows = await context.connection.any(
    getCollectionSnippets(
      getCollectionList({
        siteId,
        perPage: collectionCount,
        page,
        parentCollectionId: parent,
        onlyPublished,
      }),
      {
        siteId: Number(siteId),
        fields: ['label'],
        allCollectionFields: false,
      }
    )
  );

  console.log({ total, rows, onlyPublished, query: context.query });

  const table = mapCollectionSnippets(rows);

  const collectionsIds = Object.keys(table.collections).map(t => Number(t));

  // Not ideal being it's own query.
  const totals = await context.connection.any(getResourceCount(collectionsIds, siteId));

  const totalsIdMap = totals.reduce((state, row) => {
    state[row.resource_id] = row.total;
    return state;
  }, {} as { [id: string]: number });

  const returnCollections = [];
  for (const collectionId of collectionsIds) {
    const collection = table.collections[collectionId];
    const manifestIds = table.collection_to_manifest[collectionId] || [];
    collection.itemCount = totalsIdMap[collectionId] || 0;
    collection.items = manifestIds.map((id: number) => table.manifests[id]);
    returnCollections.push(collection);
  }

  context.response.body = {
    collections: returnCollections,
    pagination: {
      page,
      totalResults: total,
      totalPages,
    },
  } as CollectionListResponse;
};
