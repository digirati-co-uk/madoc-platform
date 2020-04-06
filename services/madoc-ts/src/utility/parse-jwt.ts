import { TokenReturn } from './verify-signed-token';
import { ApplicationState } from '../types';

export function parseJWT(token: TokenReturn): ApplicationState['jwt'] {
  return {
    token: token.token,
    user: {
      id: Number(token.payload.sub.split('urn:madoc:user:')[1]),
      name: token.payload.name,
    },
    site: {
      id: Number(token.payload.iss.split('urn:madoc:site:')[1]),
      name: token.payload.iss_name,
    },
    scope: token.payload.scope.split(' '),
    context: [token.payload.iss],
  };
}
