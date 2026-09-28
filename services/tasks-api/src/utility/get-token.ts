import { Context } from 'koa';
import { resolveAuthorizationHeader } from './resolve-authorization-header';

export function getToken(context: Context): string | null {
  const authHeader = resolveAuthorizationHeader(context);
  if (authHeader) {
    return authHeader;
  }

  if (context.query && context.query.token) {
    return context.query.token as string;
  }

  const cookie = context.cookies ? context.cookies.get('token') : undefined;
  if (cookie) {
    return cookie;
  }

  return null;
}
