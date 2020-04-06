import { ApplicationState, RouteMiddleware } from '../../types';
import { NotFoundError, sql } from 'slonik';
import { NotFound } from '../../errors/not-found';

type SiteScope = {
  id?: number;
  site_id: number;
  created_at?: Date;
  user_id?: number;
  role: string;
  scope: string;
};

type RoleMapping = {
  roles: { [role: string]: string[] };
};

function checkAdminForSite(siteId: number, jwt: ApplicationState['jwt']) {
  if (!jwt) {
    throw new NotFound();
  }
  const canSave = jwt.scope.indexOf('site.admin') !== -1;
  const jwtSiteId = jwt.site.id;
  if (!canSave || !siteId || jwtSiteId !== siteId) {
    console.log(
      `Error: User<${jwt.user.id}> tried to administer site<${jwtSiteId}> (canSave=${canSave ? 'true' : 'false'} site<${siteId}>)`,
      jwt.scope
    );
    throw new NotFound();
  }
}

export const getSiteScopes: RouteMiddleware<{ siteId: number }> = async context => {
  // Check that the user is admin of the site.
  checkAdminForSite(Number(context.params.siteId), context.state.jwt);

  try {
    const mapping = await context.connection.many<SiteScope>(
      sql`SELECT * FROM jwt_site_scopes WHERE site_id = ${context.params.siteId}`
    );

    const roles: RoleMapping['roles'] = {};
    for (const item of mapping) {
      roles[item.role] = roles[item.role] ? roles[item.role] : [];
      roles[item.role].push(item.scope);
    }

    context.response.body = { roles };
  } catch (e) {
    if (e instanceof NotFoundError) {
      // Defaults.
      context.response.body = {
        roles: context.externalConfig.permissions,
        template: true,
      };
    }
  }
};

export const saveSiteScopes: RouteMiddleware<{ siteId: number }, RoleMapping> = async context => {
  // Check that the user is admin of the site.
  checkAdminForSite(context.params.siteId, context.state.jwt);

  const toSave = context.requestBody;

  const { rows: mapping } = await context.connection.query<SiteScope>(
    sql`SELECT * FROM jwt_site_scopes WHERE site_id = ${context.params.siteId}`
  );

  const toAdd: [number, string, string][] = [];
  const toRemove: number[] = [];
  const currentKeys: string[] = [];

  // Find the removals.
  for (const item of mapping) {
    currentKeys.push(`${item.role}___${item.scope}`);
    if (!toSave.roles[item.role] || toSave.roles[item.role].indexOf(item.scope) === -1) {
      toRemove.push(item.id as number);
    }
  }

  // Find the additions.
  const roles = Object.keys(toSave.roles);
  for (const role of roles) {
    for (const scope of toSave.roles[role]) {
      if (currentKeys.indexOf(`${role}___${scope}`) === -1) {
        toAdd.push([context.params.siteId, role, scope]);
      }
    }
  }

  await context.connection.transaction(async connection => {
    if (toRemove.length) {
      await connection.query(sql`
        DELETE FROM jwt_site_scopes WHERE id IN (${sql.join(toRemove, sql`, `)})
      `);
    }
    if (toAdd.length) {
      await connection.query(sql`
        INSERT INTO jwt_site_scopes (site_id, role, scope) SELECT * FROM ${sql.unnest(toAdd, ['int4', 'text', 'text'])}
      `);
    }
  });

  context.response.body = toSave;
};
