import { userWithScope } from '../../../utility/user-with-scope';
import { RouteMiddleware } from '../../../types/route-middleware';
import { mapMetadata } from '../../../utility/iiif-metadata';
import { ItemStructureListItem } from '../../../types/schemas/item-structure-list';
import { getItemStructures } from '../../../database/queries/structure-queries';

export const getCollectionStructure: RouteMiddleware<{ id: number }> = async context => {
  const { siteId } = userWithScope(context, []);
  const collectionId = context.params.id;

  const rows = await context.connection.any(getItemStructures(collectionId, siteId));

  context.response.body = { items: mapMetadata<ItemStructureListItem>(rows) };
};
