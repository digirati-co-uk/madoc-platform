import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';
import { getToken } from '../utility/get-token';

export const jwtMock: RouteMiddleware = async (context, next) => {
  const jwt = getToken<{
    scope: string;
    iss_name: string;
    name: string;
    service: boolean;
    sub: string;
    iss: string;
    iat: number;
  }>(context);

  if (!jwt) {
    throw new NotFound();
  }

  context.state.jwt = {
    context: jwt.service ? [] : [jwt.iss],
    scope: jwt.scope.split(' ') as any[],
    user: {
      id: jwt.sub,
      name: jwt.name,
    },
    site: {
      id: jwt.iss,
      name: jwt.iss_name,
    },
  };

  await next();
};
