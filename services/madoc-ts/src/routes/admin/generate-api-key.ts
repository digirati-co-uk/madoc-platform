import { v4 } from 'uuid';
import { RouteMiddleware } from '../../types/route-middleware';
import { ApiKey } from '../../types/api-key';
import bcrypt from 'bcryptjs';
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

  const hashedSecret = await bcrypt.hash(clientSecret, 12);

  await context.apiKeys.createApiKey(
    {
      label: key.label,
      clientId,
      clientSecret: hashedSecret,
      userId: id,
      userName: name,
      scope: key.scope,
    },
    siteId
  );

  context.response.status = 200;
  context.response.body = {
    clientId,
    clientSecret,
  };
};
