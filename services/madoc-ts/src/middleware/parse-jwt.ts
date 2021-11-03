import { errors } from 'jose';
import { RouteMiddleware } from '../types/route-middleware';
import { NotAuthorized } from '../utility/errors/not-authorized';
import { NotFound } from '../utility/errors/not-found';
import { getJwtCookies } from '../utility/get-jwt-cookies';
import { getToken } from '../utility/get-token';
import { parseJWT } from '../utility/parse-jwt';
import { verifySignedToken } from '../utility/verify-signed-token';
import { errorHandler } from './error-handler';

export const parseJwt: RouteMiddleware<{ slug?: string }> = async (context, next) => {
  const slug = context.params ? context.params.slug : undefined;
  const asUser =
    context.request.headers['x-madoc-site-id'] || context.request.headers['x-madoc-user-id']
      ? {
          userId: context.request.headers['x-madoc-user-id']
            ? Number(context.request.headers['x-madoc-user-id'])
            : undefined,
          siteId: context.request.headers['x-madoc-site-id']
            ? Number(context.request.headers['x-madoc-site-id'])
            : undefined,
          userName: context.request.headers['x-madoc-user-name']
            ? context.request.headers['x-madoc-user-name']
            : undefined,
        }
      : undefined;

  if (asUser && asUser.userId && asUser.siteId && !asUser.userName) {
    try {
      const user = await context.siteManager.getSiteUserById(asUser.userId, asUser.siteId);
      if (user) {
        asUser.userName = user.name;
      }
    } catch (err) {
      // no-op
    }
  }

  // Only from the context of the Madoc site /s/{slug}/madoc
  if (slug) {
    const cookieName = context.externalConfig.cookieName || 'madoc';
    const refreshWindow = context.externalConfig.tokenRefresh || 60 * 60 * 24 * 1000; // 24 hours.
    const cookie = context.cookies.get(`${cookieName}/${slug}`, { signed: process.env.NODE_ENV !== 'test' });

    if (cookie) {
      try {
        const token = verifySignedToken(cookie);
        const parsedToken = token ? parseJWT(token) : undefined;
        if (parsedToken && parsedToken.scope.length) {
          // Set the internal state to the JWT.
          context.state.jwt = parsedToken;
        } else {
          const expiredToken = verifySignedToken(cookie, true);
          if (expiredToken) {
            const { canRefresh, hasExpired, siteId, details } = await context.siteManager.refreshExpiredToken(
              expiredToken.token,
              refreshWindow
            );

            if (hasExpired && canRefresh && details) {
              const { lastToken, cookiesToAdd } = await getJwtCookies(
                context,
                { ...details.user, sites: details.sites },
                siteId
              );
              for (const newCookie of cookiesToAdd) {
                context.cookies.set(newCookie.name, newCookie.value, newCookie.options);
              }
              if (lastToken) {
                const refreshedToken = verifySignedToken(lastToken);
                context.state.jwt = refreshedToken ? parseJWT(refreshedToken) : undefined;
              }
              return next();
            }
          }
          // Otherwise UN-set the cookie.
          context.cookies.set(cookieName, '', { signed: true });
        }
      } catch (e) {
        // Rethrow expired tokens.
        if (e instanceof errors.JWTExpired) {
          throw e;
        }
      }
      return next();
    }
  }

  if (context.request.path === '/' || context.request.path.startsWith('/auth/')) {
    return next();
  }

  try {
    // If there is no slug, then a JWT is always required, BUT it is always verified by the Gateway. We will verify
    // it anyway.
    const jwt = getToken(context);
    if (jwt) {
      const token = verifySignedToken(jwt);
      if (token) {
        context.state.jwt = parseJWT(token, asUser);
        context.state.user = context.state.jwt?.user;

        await errorHandler(context, next); // only here.

        return;
      }
    }
  } catch (e) {
    if (e instanceof errors.JWTExpired) {
      // @todo refresh?
      throw e;
    }

    throw new NotFound();
  }

  if (!slug) {
    // If we get to here, no valid token on a non-madoc endpoint.
    throw new NotAuthorized();
  }

  await next();
};
