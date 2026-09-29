import { ApplicationState, JWTConfig, Scopes } from '../types';
import { safeJsonParse } from './safe-json-parse';

export function parseToken(
  rawToken: string,
  config: JWTConfig,
  asUser?: { userId?: number; siteId?: number; userName?: string }
): ApplicationState['jwt'] | undefined {
  const [, base64Payload] = rawToken.split('.');

  if (!base64Payload) {
    return;
  }

  try {
    const payload = Buffer.from(base64Payload, 'base64');
    const tokenResp = safeJsonParse(payload.toString('utf-8'));
    if (tokenResp.error) {
      throw new Error(`Invalid token JSON encoding`);
    }
    const token = tokenResp.result;

    if (!token || !token.sub || !token.scope || !token.iss) {
      return;
    }

    const isService = !!token.service;

    const context = [];

    const userId = isService && asUser ? `${config.userUrnPrefix || 'urn:madoc:user:'}${asUser.userId}` : token.sub;
    const userName = isService && asUser && asUser.userName ? asUser.userName : token.name;

    if (isService && asUser && asUser.siteId) {
      context.push(`${config.siteUrnPrefix || 'urn:madoc:site:'}${asUser.siteId}`); // @todo remove in madoc in favour of fully resolved ids.
    } else {
      context.push(token.iss);
    }

    return {
      context: context,
      scope: typeof token.scope === 'string' ? token.scope.split(' ') : token.scope,
      user: {
        id: userId,
        name: userName,
      },
    } as {
      context: string[];
      scope: Scopes[];
      user: { id: string; service?: boolean; serviceId?: string; name: string };
    };
  } catch (err) {
    console.log(err);
    return;
  }
}
