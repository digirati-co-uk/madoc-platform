import { v4 } from 'uuid';
import { RouteMiddleware } from '../../types/route-middleware';
import { ApiKey } from '../../types/api-key';
import { sql } from 'slonik';
import { hash } from 'bcrypt';
import { onlyGlobalAdmin } from '../../utility/user-with-scope';

export const generateApiKey: RouteMiddleware<unknown, ApiKey> = async context => {
  const { id, name, siteId } = await onlyGlobalAdmin(context);

  const key = context.requestBody;

  const clientId = v4();
  const clientSecret = v4();

  if (
    !key.label ||
    !clientId ||
    !clientSecret ||
    typeof (key as any).label !== 'string' ||
    !key.scope ||
    key.scope.length === 0
  ) {
    console.log('Unable to create API key from ' + JSON.stringify(key));
    context.response.status = 422;
    return;
  }

  const hashedSecret = await hash(clientSecret, 12);

  await context.connection.query(
    sql`
      insert into api_key (label, client_id, client_secret, user_id, user_name, password_attempts, site_id, scope)
      values (
        ${key.label}, 
        ${clientId}, 
        ${hashedSecret}, 
        ${id}, 
        ${name}, 
        0, 
        ${siteId}, 
        ${sql.array(key.scope, 'text')}
      );
    `
  );

  context.response.status = 200;
  context.response.body = {
    clientId,
    clientSecret,
  };
};
