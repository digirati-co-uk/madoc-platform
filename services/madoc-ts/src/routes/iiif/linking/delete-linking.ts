import { RouteMiddleware } from '../../../types/route-middleware';
import { userWithScope } from '../../../utility/user-with-scope';
import { removeLinks } from '../../../database/queries/linking-queries';
import { RequestError } from '../../../utility/errors/request-error';

export const deleteLinking: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const linkingId = Number(context.params.id);

  const linkQuery = removeLinks([linkingId], siteId);

  if (!linkQuery) {
    throw new RequestError('Invalid link');
  }

  await context.connection.query(linkQuery);

  context.response.status = 204;
};
