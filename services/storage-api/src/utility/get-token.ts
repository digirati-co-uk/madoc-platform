import { Context } from 'koa';
import { resolveAuthorizationHeader } from './resolve-authorization-header';

export function getToken(context: Context): string | null {
  const authHeader: string = resolveAuthorizationHeader(context) as any;
  if (authHeader) {
    return authHeader as any;
  }

  if (context.query && context.query.token) {
    const token = context.query.token;

    if (Array.isArray(token)) {
      return token[0] as any;
    }

    return token as any;
  }

  const cookie = context.cookies ? context.cookies.get('token') : undefined;
  if (cookie) {
    return cookie as any;
  }

  return null;
}
