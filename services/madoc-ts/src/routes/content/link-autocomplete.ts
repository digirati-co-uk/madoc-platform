import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const linkAutocomplete: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const query = context.query.q;

  context.response.body = {
    query,
    siteId,
    results: [],
  };
};
