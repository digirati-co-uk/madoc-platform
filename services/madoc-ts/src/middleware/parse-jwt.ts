import { verifySignedToken } from '../utility/verify-signed-token';
import { parseJWT } from '../utility/parse-jwt';
import { getToken } from '../utility/get-token';
import { NotFound } from '../utility/errors/not-found';
import { RouteMiddleware } from '../types/route-middleware';

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
        }
      : undefined;

  // Only from the context of the Madoc site /s/{slug}/madoc
  if (slug) {
    const cookieName = context.externalConfig.cookieName || 'madoc';
    const cookie = context.cookies.get(`${cookieName}/${slug}`, { signed: true });

    if (cookie) {
      try {
        const token = verifySignedToken(cookie);
        if (token) {
          // Set the internal state to the JWT.
          context.state.jwt = parseJWT(token);
        } else {
          // Otherwise UN-set the cookie.
          context.cookies.set(cookieName, { signed: true });
        }
      } catch (e) {
        console.log(e);
      }
      return next();
    }
  }

  // If there is no slug, then a JWT is always required, BUT it is always verified by the Gateway. We will verify
  // it anyway.
  const jwt = getToken(context);
  if (jwt) {
    const token = verifySignedToken(jwt);
    if (token) {
      context.state.jwt = parseJWT(token, asUser);
      await next(); // only here.
      return;
    }
  }

  if (!slug) {
    // If we get to here, no valid token on a non-madoc endpoint.
    throw new NotFound();
  }

  await next();
};
