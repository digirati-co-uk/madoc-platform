import { getDerivedMetadata } from '../../database/queries/metadata-queries';
import { GetMetadata } from '../../types/schemas/get-metadata';
import { userWithScope } from '../../utility/user-with-scope';
import { getProjectCollectionId } from '../../database/queries/project-queries';
import { RouteMiddleware } from '../../types/route-middleware';

export const getProjectMetadata: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, []);
  const projectId = Number(context.params.id);

  const scope = context.state.jwt?.scope || [];
  const onlyPublished = scope.indexOf('site.admin') === -1;

  const { collection_id } = await context.connection.one(getProjectCollectionId(projectId, siteId, onlyPublished));

  const collection = await context.connection.many(getDerivedMetadata(collection_id, 'collection', siteId));

  context.response.body = {
    fields: collection,
    template: ['label', 'summary'],
  } as GetMetadata;
};
