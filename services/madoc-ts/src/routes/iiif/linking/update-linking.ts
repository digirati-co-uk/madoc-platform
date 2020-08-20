import { RouteMiddleware } from '../../../types/route-middleware';
import { userWithScope } from '../../../utility/user-with-scope';
import { ResourceLink, updateLinks } from '../../../database/queries/linking-queries';
import { RequestError } from '../../../utility/errors/request-error';

export const updateLinking: RouteMiddleware<{}, { link: ResourceLink; resource_id: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const { link, resource_id } = context.request.body;

  const linkQuery = updateLinks([link], resource_id, siteId);

  if (!linkQuery) {
    throw new RequestError('Invalid link');
  }

  await context.connection.query(linkQuery);

  context.response.status = 201;
};
