import { ItemStructureListItem } from '../../types/schemas/item-structure-list';
import { userWithScope } from '../../utility/user-with-scope';
import { getItemStructures } from '../../database/queries/structure-queries';
import { mapMetadata } from '../../utility/iiif-metadata';
import { RouteMiddleware } from '../../types/route-middleware';
import { getProjectCollectionId } from '../../database/queries/project-queries';

export const getProjectStructure: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, []);
  const projectId = Number(context.params.id);

  const { collection_id } = await context.connection.one(getProjectCollectionId(projectId, siteId));

  const rows = await context.connection.any(getItemStructures(collection_id, siteId));

  context.response.body = {
    collectionId: collection_id,
    items: mapMetadata<ItemStructureListItem>(rows),
  };
};
