import { RouteMiddleware } from '../../types/route-middleware';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

export const allUsersAutocomplete: RouteMiddleware = async context => {
  await onlyGlobalAdmin(context);
  const q = (context.query.q || '').trim();

  context.response.body = { users: await context.siteManager.searchAllUsers(q) };
};
