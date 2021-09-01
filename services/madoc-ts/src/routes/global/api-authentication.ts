import { RouteMiddleware } from '../../types/route-middleware';
import { sql } from 'slonik';
import { compare } from 'bcrypt';
import { createSignedToken } from '../../utility/create-signed-token';

type ApiAuthenticationRequest = {
  clientId: string;
  clientSecret: string;
};

export const authenticateApi: RouteMiddleware<{ slug: string }, ApiAuthenticationRequest> = async context => {
  const authenticationRequest = context.requestBody;

  const site = await context.connection.one(
    sql<{ id: number, title: string }>`
      select id, title from site where slug = ${context.params.slug};
    `
  );

  if (!authenticationRequest.clientId || !authenticationRequest.clientSecret) {
    console.log('Unable to validate API key');
    context.response.status = 422;
    return;
  }

  const stored = await context.connection.maybeOne(
    sql<{ id: number, client_secret: string, user_id: number, user_name: string, password_attempts: number }>`
      select * from api_key
      where client_id = ${authenticationRequest.clientId};
    `
  );

  if (!stored) {
    console.log('Unable to find API key with client ID ' + authenticationRequest.clientId);
    context.response.status = 404;
    return;
  }

  if (stored.password_attempts >= 3) {
    console.log('API key with client ID ' + authenticationRequest.clientId + ' has too many failed login attempts');
    context.response.status = 401;
    return;
  }

  const secretMatches = await compare(authenticationRequest.clientSecret, stored.client_secret);
  if (!secretMatches) {

    await context.connection.query(sql`
      update api_key
      set password_attempts = ${stored.password_attempts + 1}
      where id = ${stored.id}
    `);

    console.log('Incorrect secret for API key with client ID ' + authenticationRequest.clientId);
    context.response.status = 401;
    return;
  }

  await context.connection.query(sql`
    update api_key
    set password_attempts = 0
    where id = ${stored.id}
  `);

  const scopes = await context.connection.many(
    sql<{ scope: string }>`
      select scope from api_key_scope where key_id = ${stored.id};
    `
  );
  const scope = scopes.map(s => s.scope);

  const token = createSignedToken({
    site: { id: site.id, name: site.title },
    user: { id: stored.user_id, name: stored.user_name },
    scope,
    expiresIn: 24 * 60 * 60,
  });

  context.response.body = {
    token,
  };
};
