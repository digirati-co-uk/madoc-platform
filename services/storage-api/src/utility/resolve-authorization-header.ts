import { Context } from 'koa';

export function resolveAuthorizationHeader(
  ctx: Context,
  { passthrough = false }: { passthrough?: boolean } = {}
): string | undefined {
  if (!ctx.header || !ctx.header.authorization) {
    return;
  }

  const parts = ctx.header.authorization.split(' ');

  if (parts.length === 2) {
    const scheme = parts[0];
    const credentials = parts[1];

    if (/^Bearer$/i.test(scheme)) {
      return credentials as any;
    }
  }
  if (!passthrough) {
    ctx.throw(401, 'Bad Authorization header format. Format is "Authorization: Bearer <token>"');
  }
}
