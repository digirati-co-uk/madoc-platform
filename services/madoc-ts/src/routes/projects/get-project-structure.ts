import { ItemStructureListItem } from '../../types/schemas/item-structure-list';
import { NotFound } from '../../utility/errors/not-found';
import { parseProjectId } from '../../utility/parse-project-id';
import { userWithScope } from '../../utility/user-with-scope';
import { getItemStructures } from '../../database/queries/structure-queries';
import { mapMetadata } from '../../utility/iiif-metadata';
import { RouteMiddleware } from '../../types/route-middleware';
import { getProjectCollectionId } from '../../database/queries/project-queries';

export const getProjectStructure: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, []);
  const { projectSlug, projectId } = parseProjectId(context.params.id);

  if (!projectId && !projectSlug) {
    throw new NotFound();
  }

  const scope = context.state.jwt?.scope || [];
  const onlyPublished = scope.indexOf('site.admin') === -1;

  const { collection_id } = await context.connection.one(
    getProjectCollectionId({ projectId, projectSlug }, siteId, onlyPublished)
  );

  const rows = await context.connection.any(getItemStructures(collection_id, siteId));

  context.response.body = {
    collectionId: collection_id,
    items: mapMetadata<ItemStructureListItem>(rows),
  };
};
