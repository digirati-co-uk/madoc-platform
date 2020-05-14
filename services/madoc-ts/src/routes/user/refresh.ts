import { RouteMiddleware } from '../../types/route-middleware';
import { verifySignedToken } from '../../utility/verify-signed-token';
import { NotFound } from '../../utility/errors/not-found';
import { getJwtCookies } from '../../utility/get-jwt-cookies';
import { parseJWT } from '../../utility/parse-jwt';

export const refreshToken: RouteMiddleware<{ slug: string }, { token: string }> = async context => {
  // No authentication required for this.
  const { token } = context.requestBody;

  // Configuration
  const refreshWindow = 60 * 60 * 24 * 1000; // 24 hours.

  try {
    // Parse token, ignoring expiry
    const response = verifySignedToken(token, true);
    if (!response) {
      throw new NotFound();
    }

    const userDetails = parseJWT(response);
    if (!userDetails || userDetails.user.service || !userDetails.user.id) {
      throw new NotFound();
    }

    const { payload } = response;

    const exp = payload.exp * 1000;
    const time = new Date().getTime();
    const allowedTime = time - refreshWindow;
    const canRefresh = exp - allowedTime > 0;
    const hasExpired = exp - time < 0;
    if (!hasExpired) {
      context.response.status = 200;
      context.response.body = { token };
    }

    if (!canRefresh) {
      context.response.status = 403;
      context.response.body = { error: 'Refresh window has expired' };
      return;
    }

    const userResp = await context.omeka.getUser(userDetails.user.id);
    if (!userResp) {
      context.response.status = 403;
      context.response.body = { error: 'User not found' };
      return;
    }
    const { user, sites } = userResp;

    const { lastToken, cookiesToAdd } = await getJwtCookies(context, { ...user, sites }, userDetails.site.id);

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
