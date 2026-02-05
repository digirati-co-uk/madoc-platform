import { sql } from 'slonik';
import { createSignedToken } from './create-signed-token';
import { AuthenticatedUser } from '../types/authenticated-user';
import { Context } from 'koa';
import { DEFAULT_TOKEN_EXPIRY, DEFAULT_TOKEN_REFRESH } from '../config';

export async function getJwtCookies(
  context: Context,
  user: AuthenticatedUser,
  siteId?: number,
  retry = false
): Promise<{
  lastToken?: string;
  cookiesToAdd: Array<{ name: string; value: string; options: any }>;
  siteIds?: string[];
}> {
  const cookiesToAdd: Array<{ name: string; value: string; options: any }> = [];
  let lastToken;
  let siteToken;
  const expiresIn = context.externalConfig.tokenExpires || DEFAULT_TOKEN_EXPIRY; // 7-day token.
  const cookieName = context.externalConfig.cookieName || 'madoc';
  const refreshWindow = context.externalConfig.tokenRefresh || DEFAULT_TOKEN_REFRESH; // 24-hour refresh

  const siteIds: string[] = [];
  // Loop all of the sites the user is to be logged into.
  for (const site of user.sites) {
    // Find the scopes for this site and user with this role.
    const scopesForJWT = await context.connection.any<{ scope: string }>(
      sql`SELECT scope FROM jwt_site_scopes WHERE site_id=${site.id} AND role=${site.role}`
    );

    if (scopesForJWT.length === 0 && !retry) {
      // @todo May need to sync JWTs here in Postgres.

      return getJwtCookies(context, user, siteId, true);
    }

    const domain = `/s/${site.slug}`;
    const token = await createSignedToken({
      site: { id: site.id, name: site.title },
      user,
      scope: scopesForJWT.map(s => s.scope),
      expiresIn,
    });

    if (!token) {
      console.log(`Unable to generate token for user ${user.name} (id: ${user.id})`);
      return { lastToken: undefined, cookiesToAdd: [] };
    }

    siteIds.push(site.slug);

    cookiesToAdd.push({
      name: `${cookieName}/${site.slug}`,
      value: token,
      options: {
        path: domain,
        maxAge: (expiresIn + refreshWindow) * 1000,
        overwrite: true,
        signed: true,
        httpOnly: false,
      },
    });

    if (siteId === site.id) {
      siteToken = token;
    }

    lastToken = token;
  }

  if (siteToken) {
    return { lastToken: siteToken, cookiesToAdd, siteIds };
  }

  return { lastToken, cookiesToAdd, siteIds };
}
