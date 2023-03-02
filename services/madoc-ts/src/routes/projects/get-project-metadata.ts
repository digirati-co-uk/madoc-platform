import { getDerivedMetadata } from '../../database/queries/metadata-queries';
import { GetMetadata } from '../../types/schemas/get-metadata';
import { parseProjectId } from '../../utility/parse-project-id';
import { userWithScope } from '../../utility/user-with-scope';
import { getProjectCollectionId } from '../../database/queries/project-queries';
import { RouteMiddleware } from '../../types/route-middleware';

export const getProjectMetadata: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, []);
  const { projectId, projectSlug } = parseProjectId(context.params.id);

  const scope = context.state.jwt?.scope || [];
  const onlyPublished = scope.indexOf('site.admin') === -1;

  const { collection_id } = await context.connection.one(
    getProjectCollectionId({ projectId, projectSlug }, siteId, onlyPublished)
  );

  try {
    const collection = await context.connection.any(getDerivedMetadata(collection_id, 'collection', siteId));

    context.response.body = {
      fields: collection,
      template: ['label', 'summary'],
    } as GetMetadata;
  } catch (e) {
    context.response.body = {
      fields: [],
      template: ['label', 'summary'],
    } as GetMetadata;
  }
};
