import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { getJwtCookies } from '../../utility/get-jwt-cookies';

export const refreshToken: RouteMiddleware<{ slug: string }, { token: string }> = async context => {
  // No authentication required for this.
  const { token } = context.requestBody;

  // Configuration
  const refreshWindow = context.externalConfig.tokenRefresh || 60 * 60 * 24; // 24 hours.

  try {
    const { canRefresh, hasExpired, siteId, details: userResp } = await context.siteManager.refreshExpiredToken(
      token,
      refreshWindow
    );

    if (!hasExpired) {
      context.response.status = 200;
      context.response.body = { token };
    }

    if (!canRefresh) {
      context.response.status = 403;
      context.response.body = { error: 'Refresh window has expired' };
      return;
    }

    if (!userResp) {
      context.response.status = 403;
      context.response.body = { error: 'User not found' };
      return;
    }
    const { user, sites } = userResp;
    const { lastToken, cookiesToAdd } = await getJwtCookies(context, { ...user, sites }, siteId);
    for (const cookie of cookiesToAdd) {
      context.cookies.set(cookie.name, cookie.value, cookie.options);
    }

    context.response.status = 201;
    context.response.body = { token: lastToken };
  } catch (e) {
    if (e instanceof NotFound) {
      throw e;
    }
    context.response.status = 403;
    context.response.body = { error: 'Invalid token' };
    return;
  }
};
