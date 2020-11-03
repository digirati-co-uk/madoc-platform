import { RouteMiddleware } from '../types';
import { getToken } from '../utility/get-token';
import { parseToken } from '../utility/parse-token';
import { RequestError } from '../errors/request-error';

export const parseJwt: RouteMiddleware = async (context, next) => {
  const token = getToken(context);

  if (!context.path.startsWith('/api/')) {
    await next();
    return;
  }

  if (!token) {
    throw new RequestError('JWT Not found');
  }

  const asUser =
    context.request.headers['x-madoc-site-id'] || context.request.headers['x-madoc-user-id']
      ? {
          siteId: context.request.headers['x-madoc-site-id']
            ? Number(context.request.headers['x-madoc-site-id'])
            : undefined,
          userId: context.request.headers['x-madoc-user-id']
            ? Number(context.request.headers['x-madoc-user-id'])
            : undefined,
        }
      : undefined;

  const jwt = parseToken(token, asUser);

  if (!jwt) {
    throw new RequestError();
  }

  context.state.jwt = jwt;

  await next();
};
