import { Context } from 'koa';
import { JWT } from 'jose';
import { resolveAuthorizationHeader } from './resolve-authorization-header';

export function getToken<Token extends {}>(context: Context): Token | null {
  const authHeader: string = resolveAuthorizationHeader(context);
  if (authHeader) {
    return JWT.decode(authHeader) as Token;
  }

  if (context.query && context.query.token) {
    return JWT.decode(context.query.token) as Token;
  }

  const cookie = context.cookies ? context.cookies.get('token') : undefined;
  if (cookie) {
    return JWT.decode(cookie) as Token;
  }

  return null;
}
