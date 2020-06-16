import { RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';
import { getToken } from '../utility/get-token';
import { parseToken } from '../utility/parse-token';

export const parseJwt: RouteMiddleware = async (context, next) => {
  const token = getToken(context);

  if (!token) {
    throw new NotFound();
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
    throw new NotFound();
  }

  context.state.jwt = jwt;

  await next();
};
