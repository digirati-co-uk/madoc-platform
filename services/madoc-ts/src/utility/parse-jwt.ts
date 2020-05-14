import { TokenReturn } from './verify-signed-token';
import { ApplicationState } from '../types/application-state';

export function parseJWT(token: TokenReturn, asUser?: { userId?: number; siteId?: number }): ApplicationState['jwt'] {
  const userId = token.payload.service
    ? token.payload.sub.split('urn:madoc:service:')[1]
    : Number(token.payload.sub.split('urn:madoc:user:')[1]);

  const gateway = token.payload.iss === 'urn:madoc:gateway';

  const isService = !!token.payload.service;

  return {
    token: token.token,
    user: {
      id: isService && asUser ? asUser.userId : Number(token.payload.sub.split('urn:madoc:user:')[1]),
      service: isService,
      serviceId: isService ? (userId as string) : undefined,
      name: token.payload.name,
    },
    site: {
      gateway,
      id: gateway
        ? isService && asUser && asUser.siteId
          ? asUser.siteId
          : 0
        : Number(token.payload.iss.split('urn:madoc:site:')[1]),
      name: token.payload.iss_name,
    },
    scope: token.payload.scope.split(' '),
    context: [token.payload.iss],
  };
}
