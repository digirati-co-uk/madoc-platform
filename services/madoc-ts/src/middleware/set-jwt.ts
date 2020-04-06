import { RouteMiddleware } from '../types';
import { sql } from 'slonik';
import { createSignedToken } from '../utility/create-signed-token';
import fetch from 'node-fetch';

const omekaUrl = process.env.OMEKA__URL as string;

export const setJwt: RouteMiddleware<{ slug?: string }> = async (context, next) => {
  await next();

  let lastToken;
  // If a user has been set, but no JWT is available...
  // Maybe also check if 404?
  if (context.params && context.params.slug && context.state.authenticatedUser && !context.state.jwt) {
    // Then set the cookies, so that the JWT can be parsed in future requests.
    // This indicates that the application has authenticated the user, but not yet assigned permissions.
    const user = context.state.authenticatedUser;
    const expiresIn = context.externalConfig.tokenExpires || 3600;
    const cookieName = context.externalConfig.cookieName || 'madoc';

    // Loop all of the sites the user is to be logged into.
    for (const site of user.sites) {
      // Find the scopes for this site and user with this role.
      const scopesForJWT = await context.connection.any<{ scope: string }>(
        sql`SELECT scope FROM jwt_site_scopes WHERE site_id=${site.id} AND role=${site.role}`
      );

      const domain = `/s/${site.slug}`;
      const token = createSignedToken({
        site: { id: site.id, name: site.title },
        user,
        scope: scopesForJWT.map(s => s.scope),
        expiresIn,
      });

      if (!token) {
        console.log(`Unable to generate token for user ${user.name} (id: ${user.id})`);
        return;
      }

      context.cookies.set(`${cookieName}/${site.slug}`, token, {
        path: domain,
        maxAge: expiresIn * 1000,
        overwrite: true,
        signed: true,
      });

      lastToken = token;
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
