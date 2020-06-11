import { ApplicationState, Scopes } from '../types';

export function parseToken(
  rawToken: string,
  asUser?: { userId?: number; siteId?: number }
): ApplicationState['jwt'] | undefined {
  const [, base64Payload] = rawToken.split('.');

  if (!base64Payload) {
    return;
  }

  try {
    const payload = Buffer.from(base64Payload, 'base64');
    const token = JSON.parse(payload.toString('ascii'));

    if (!token || !token.sub || !token.scope || !token.iss) {
      return;
    }

    const isService = !!token.service;

    const context = [];

    const userId = isService && asUser ? `urn:madoc:user:${asUser.userId}` : token.sub;

    if (isService && asUser && asUser.siteId) {
      context.push(`urn:madoc:site:${asUser.siteId}`); // @todo remove in madoc in favour of fully resolved ids.
    } else {
      context.push(token.iss);
    }

    return {
      context: context,
      scope: token.scope.split(' '),
      user: {
        id: userId,
        name: token.name,
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
