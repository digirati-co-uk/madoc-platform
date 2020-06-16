import { RouteMiddleware } from '../../../types/route-middleware';
import { optionalUserWithScope } from '../../../utility/user-with-scope';
import { getParentResources } from '../../../database/queries/resource-queries';

export const getCanvasManifests: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = optionalUserWithScope(context, []);
  const canvasId = context.params.id;
  const projectId = context.query.project_id;

  const results = await context.connection.any(getParentResources(canvasId, siteId, projectId));

  context.response.body = { manifests: results.map(resource => resource.resource_id) };
};
