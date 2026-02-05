import type { Context } from 'hono';

function toBase64(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  if (padding === 0) {
    return normalized;
  }
  return normalized + '='.repeat(4 - padding);
}

function readTokenFromHeaders(context: Context): string | undefined {
  const bearerHeader = context.req.header('Bearer') ?? context.req.header('BEARER');
  if (bearerHeader) {
    return bearerHeader.replace(/^Bearer\s+/i, '').trim();
  }

  const authorization = context.req.header('Authorization');
  if (!authorization) {
    return undefined;
  }

  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (match) {
    return match[1].trim();
  }

  return authorization.trim();
}

export function jwtPayloadFromRequest(context: Context): Record<string, unknown> | null {
  const token = readTokenFromHeaders(context);
  if (!token) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length < 2 || !parts[1]) {
    return null;
  }

  try {
    const decoded = Buffer.from(toBase64(parts[1]), 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    if (parsed && typeof parsed === 'object') {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return null;
  }

  return null;
}

export function getHeaderMadocSiteUrn(context: Context): string | null {
  const siteId = context.req.header('x-madoc-site-id');
  if (!siteId) {
    return null;
  }
  return `urn:madoc:site:${siteId}`;
}

export function requestMadocSiteUrn(context: Context): string | null {
  const payload = jwtPayloadFromRequest(context);
  if (!payload) {
    return null;
  }

  if (payload.service === true) {
    return getHeaderMadocSiteUrn(context);
  }

  const iss = payload.iss;
  return typeof iss === 'string' ? iss : null;
}
