import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const userAutocomplete: RouteMiddleware = async context => {
  // @todo need scope for reading user data.
  const { siteId } = userWithScope(context, ['tasks.create']);
  const q = (context.query.q || '').trim();
  const roles = (context.query.roles || '')
    .split(',')
    .map((r: string) => r.trim())
    .filter((e: string) => e);

  context.response.body = {
    users: await context.siteManager.searchUsers(q, siteId, roles),
  };
};
