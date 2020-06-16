import { RouteMiddleware } from '../../../types/route-middleware';
import { optionalUserWithScope } from '../../../utility/user-with-scope';
import { getParentResources } from '../../../database/queries/resource-queries';

export const getManifestCollections: RouteMiddleware = async context => {
  const { siteId } = optionalUserWithScope(context, []);
  const manifestId = context.params.id;
  const projectId = context.query.project_id;

  const results = await context.connection.any(getParentResources(manifestId, siteId, projectId));

  context.response.body = { collections: results.map(resource => resource.resource_id) };
};
