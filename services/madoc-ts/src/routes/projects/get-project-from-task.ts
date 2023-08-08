import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const getProjectFromTask: RouteMiddleware = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.view']);
  context.response.body = await context.projects.getProjectByTaskId(context.params.id, siteId);
};
