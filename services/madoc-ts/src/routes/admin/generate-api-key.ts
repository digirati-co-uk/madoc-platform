import { RouteMiddleware } from '../../types/route-middleware';
import { ApiKey } from '../../types/api-key';
import { sql } from 'slonik';
import { hash } from 'bcrypt';
import { userWithScope } from '../../utility/user-with-scope';

export const generateApiKey: RouteMiddleware<void, ApiKey> = async context => {
  const { id, name } = userWithScope(context, ['site.admin']);
  const key = context.requestBody;

  if (!key.label || !key.clientId || !key.clientSecret) {
    console.log('Unable to create API key from ' + JSON.stringify(key));
    context.response.status = 422;
    return;
  }

  const stored = await context.connection.maybeOne(
    sql<{ client_id: string }>`
      select client_id from api_key where client_id = ${key.clientId};
    `
  );
  if (stored?.client_id) {
    console.log('Unable to create duplicate API key for client ' + key.clientId);
    context.response.status = 409;
    return;
  }

  const hashedSecret = await hash(key.clientSecret, 10);

  await context.connection.query(
    sql`
      insert into api_key (label, client_id, client_secret, user_id, user_name, password_attempts)
      values (${key.label}, ${key.clientId}, ${hashedSecret}, ${id}, ${name}, 0);
    `
  );
  const storedKey = await context.connection.one(
    sql<{ id: number }>`
      select id from api_key where client_id = ${key.clientId};
    `
  );
  for (let i in key.scopes) {
    await context.connection.query(
      sql`
        insert into api_key_scope (key_id, scope)
        values (${storedKey.id}, ${key.scopes[i]});
      `
    );
  }

  context.response.status = 200;
};
