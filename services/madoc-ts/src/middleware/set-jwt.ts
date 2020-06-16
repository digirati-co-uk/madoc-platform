import fetch from 'node-fetch';
import { RouteMiddleware } from '../types/route-middleware';
import { getJwtCookies } from '../utility/get-jwt-cookies';

const omekaUrl = process.env.OMEKA__URL as string;

export const setJwt: RouteMiddleware<{ slug?: string }> = async (context, next) => {
  await next();

  // If a user has been set, but no JWT is available...
  // Maybe also check if 404?
  if (context.params && context.params.slug && context.state.authenticatedUser && !context.state.jwt) {
    // Then set the cookies, so that the JWT can be parsed in future requests.
    // This indicates that the application has authenticated the user, but not yet assigned permissions.
    const user = context.state.authenticatedUser;

    const { lastToken, cookiesToAdd, siteIds } = await getJwtCookies(context, user);

    for (const cookie of cookiesToAdd) {
      context.cookies.set(cookie.name, cookie.value, cookie.options);
    }

    if (siteIds) {
      context.cookies.set('madoc-sites', siteIds.join(','), {
        overwrite: true,
        signed: true,
        httpOnly: false,
      });
    }

    if (lastToken) {
      // After we've set the token, pass the cookie (with the users current session) and the JWT so it can update
      // the session.
      // @todo We can make Omeka refresh the session id, and then proxy down the Set-Cookie header.
      await fetch(`${omekaUrl}/s/${context.params.slug}/_template`, {
        method: 'HEAD',
        headers: {
          cookie: context.req.headers.cookie ? context.req.headers.cookie.toString() : '',
          Authorization: `Bearer ${lastToken}`,
        },
      });
    }
  }
};
