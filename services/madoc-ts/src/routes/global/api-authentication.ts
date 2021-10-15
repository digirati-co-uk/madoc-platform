import { RouteMiddleware } from '../../types/route-middleware';
import { sql } from 'slonik';
import { compare } from 'bcrypt';
import { createSignedToken } from '../../utility/create-signed-token';
import { NotAuthorized } from '../../utility/errors/not-authorized';
import { RequestError } from '../../utility/errors/request-error';

type ApiAuthenticationRequest = {
  client_id: string;
  client_secret: string;
};

export const authenticateApi: RouteMiddleware<{ slug: string }, ApiAuthenticationRequest> = async context => {
  const authenticationRequest = context.requestBody;

  if (!authenticationRequest.client_id || !authenticationRequest.client_secret) {
    throw new RequestError('Unable to validate API key');
  }

  const stored = await context.connection.maybeOne(
    sql<{
      id: number;
      client_id: string;
      client_secret: string;
      user_id: number;
      user_name: string;
      password_attempts: number;
      site_id: number;
      scope: string[];
    }>`
      select * from api_key
      where client_id = ${authenticationRequest.client_id};
    `
  );

  if (!stored || !stored.site_id || !stored.client_secret || !stored.user_id) {
    console.log('Unable to find API key with client ID ' + authenticationRequest.client_id);
    throw new NotAuthorized();
  }

  if (stored.password_attempts >= 3) {
    console.log('API key with client ID ' + authenticationRequest.client_id + ' has too many failed login attempts');
    throw new NotAuthorized();
  }

  const secretMatches = await compare(authenticationRequest.client_secret, stored.client_secret);
  if (!secretMatches) {
    await context.connection.query(sql`
      update api_key
      set password_attempts = ${stored.password_attempts + 1}
      where id = ${stored.id}
    `);

    console.log('Incorrect secret for API key with client ID ' + authenticationRequest.client_id);
    throw new NotAuthorized();
  }

  await context.connection.query(sql`
    update api_key
    set password_attempts = 0, last_used = CURRENT_TIMESTAMP
    where id = ${stored.id}
  `);

  const user = await context.siteManager.getUserById(stored.user_id);
  if (!user || user.role !== 'global_admin') {
    // Prevent users who were previously global admins from using these tokens.
    // @todo we could also delete these tokens?
    throw new NotAuthorized();
  }

  const site = await context.siteManager.getSiteById(stored.site_id);
  const token = createSignedToken({
    site: { id: site.id, name: site.title },
    user: { id: stored.user_id, name: stored.user_name },
    scope: stored.scope,
    expiresIn: 24 * 60 * 60,
  });

  context.response.body = {
    token,
  };
};
