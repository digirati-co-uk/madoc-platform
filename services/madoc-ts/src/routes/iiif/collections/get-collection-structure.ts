import { optionalUserWithScope } from '../../../utility/user-with-scope';
import { RouteMiddleware } from '../../../types/route-middleware';
import { mapMetadata } from '../../../utility/iiif-metadata';
import { ItemStructureListItem } from '../../../types/schemas/item-structure-list';
import { getItemStructures } from '../../../database/queries/structure-queries';
import { requireCollection } from './require-collection';

export const getCollectionStructure: RouteMiddleware<{ id: number }> = async context => {
  const { siteId } = optionalUserWithScope(context, []);
  const collectionId = context.params.id;

  await requireCollection(context.connection, collectionId, siteId);
  const rows = await context.connection.any(getItemStructures(collectionId, siteId));

  context.response.body = { items: mapMetadata<ItemStructureListItem>(rows) };
};
