import { Pool } from 'mysql';
import { DatabasePoolType, sql } from 'slonik';
import { mysql } from './mysql';
import { ExternalConfig } from '../types/external-config';

export async function syncOmeka(omeka: Pool, postgres: DatabasePoolType, config: ExternalConfig) {
  // Get sites.
  const sites = await new Promise<Array<{ id: number; title: string }>>(resolve =>
    omeka.query(mysql`SELECT id, title FROM site`, (err, content) => resolve(content))
  );

  // Helper to create default permissions for a site,
  function getDefaultPermissions(siteId: number) {
    const toAdd: Array<[number, string, string]> = [];
    const roles = Object.keys(config.permissions);
    for (const role of roles) {
      for (const scope of config.permissions[role]) {
        toAdd.push([siteId, role, scope]);
      }
    }
    return toAdd;
  }

  // Apply default configuration, if no configuration exists.
  for (const site of sites) {
    const { rowCount } = await postgres.query(sql`SELECT id FROM jwt_site_scopes WHERE site_id = ${site.id}`);
    if (rowCount === 0) {
      console.log(`Adding missing permissions to site ${site.title}`);
      await postgres.query(sql`
        INSERT INTO jwt_site_scopes (site_id, role, scope) SELECT * FROM ${sql.unnest(getDefaultPermissions(site.id), [
          'int4',
          'text',
          'text',
        ])}
      `);
    }
  }
}
