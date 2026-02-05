import { RouteMiddleware } from '../../types/route-middleware';
import { createSignedToken } from '../../utility/create-signed-token';
import { NotAuthorized } from '../../utility/errors/not-authorized';
import { RequestError } from '../../utility/errors/request-error';
import { ApiAuthenticationRequest } from '../../repository/api-key-repository';

export const authenticateApi: RouteMiddleware<{ slug: string }, ApiAuthenticationRequest> = async context => {
  const authenticationRequest = context.requestBody;

  if (!authenticationRequest.client_id || !authenticationRequest.client_secret) {
    throw new RequestError('Unable to validate API key');
  }

  const stored = await context.apiKeys.validateApiKey(authenticationRequest);

  const user = await context.siteManager.getUserById(stored.user_id);
  if (!user || user.role !== 'global_admin') {
    // Prevent users who were previously global admins from using these tokens.
    // @todo we could also delete these tokens?
    throw new NotAuthorized();
  }

  const site = await context.siteManager.getSiteById(stored.site_id);
  const token = await createSignedToken({
    site: { id: site.id, name: site.title },
    user: { id: stored.user_id, name: stored.user_name },
    scope: stored.scope,
    expiresIn: 24 * 60 * 60,
  });

  context.response.body = {
    token,
  };
};
