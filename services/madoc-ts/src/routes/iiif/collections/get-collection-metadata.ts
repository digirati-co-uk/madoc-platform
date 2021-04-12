import { optionalUserWithScope } from '../../../utility/user-with-scope';
import { RouteMiddleware } from '../../../types/route-middleware';
import { GetMetadata } from '../../../types/schemas/get-metadata';
import { getDerivedMetadata } from '../../../database/queries/metadata-queries';

// @todo join to original columns to get canonical value.
export const getCollectionMetadata: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = optionalUserWithScope(context, []);
  const collectionId = Number(context.params.id);

  const collection = await context.connection.many(getDerivedMetadata(collectionId, 'collection', siteId));

  context.response.body = {
    fields: collection,
    template: ['label', 'summary'],
  } as GetMetadata;
};
