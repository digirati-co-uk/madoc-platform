import { JWTConfig, RouteMiddleware } from '../types';
import { NotFound } from '../errors/not-found';
import { getToken } from '../utility/get-token';
import { parseToken } from '../utility/parse-token';

export function parseJwt(_config: JWTConfig = {}): RouteMiddleware {
  const config: JWTConfig = _config || {};

  return async (context, next) => {
    const token = getToken(context);

    if (!token) {
      throw new NotFound();
    }

    const userIdHeader = config.userIdHeader || 'x-madoc-user-id';
    const userNameHeader = config.userNameHeader || 'x-madoc-user-name';
    const siteIdHeader = config.siteIdHeader || 'x-madoc-site-id';

    const asUser =
      context.request.headers[siteIdHeader] || context.request.headers[userIdHeader]
        ? {
            siteId: context.request.headers[siteIdHeader] ? Number(context.request.headers[siteIdHeader]) : undefined,
            userId: context.request.headers[userIdHeader] ? Number(context.request.headers[userIdHeader]) : undefined,
            userName: context.request.headers[userNameHeader] ? context.request.headers[userNameHeader] : undefined,
          }
        : undefined;

    const jwt = parseToken(token, config, asUser as any);

    if (!jwt) {
      throw new NotFound();
    }

    context.state.jwt = jwt;

    await next();
  };
}
