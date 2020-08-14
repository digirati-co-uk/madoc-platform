import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';
import { createSignedToken } from '../../utility/create-signed-token';

export const personalAccessToken: RouteMiddleware<{ slug: string }> = async context => {
  const { id, name, siteId, scope, siteName } = userWithScope(context, ['site.admin']);

  const token = createSignedToken({
    site: { id: siteId, name: siteName },
    user: { id, name },
    scope,
    expiresIn: 24 * 60 * 60 * 365,
  });

  context.response.body = {
    token,
  };
};
