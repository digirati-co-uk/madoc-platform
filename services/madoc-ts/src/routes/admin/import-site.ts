import { escape } from 'mysql';
import { SitePermission } from '../../types/omeka/SitePermission';
import { SiteSetting } from '../../types/omeka/SiteSetting';
import { User } from '../../types/omeka/User';
import { RouteMiddleware } from '../../types/route-middleware';
import { raw, mysql } from '../../utility/mysql';

export const importSite: RouteMiddleware = async context => {
  // This is ONLY for test environments for now.
  // if (process.env.NODE_ENV !== 'test') {
  //   throw new NotFound();
  // }

  const data = context.request.body;

  // For tests:
  // - Drop all tasks where context matches site.
  // - Drop all capture models where context matches site.
  // - This code will ensure the correctness for the rest.

  const runSql = <T = any>(queryString: string) => {
    return new Promise<T>((resolve, reject) =>
      context.mysql.query(queryString, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      })
    );
  };

  if (data.omeka) {
    // 1.2 Upsert Omeka site.
    // First delete the site - which should cascade.
    if (data.omeka.site) {
      await runSql(mysql`
        delete from site_page_block where page_id IN (select id from site_page where site_id = ${data.omeka.site.id})
      `);
      await runSql(mysql`
        delete from site_page where site_id = ${data.omeka.site.id}
      `);
      await runSql(mysql`
        delete from site_permission where site_id = ${data.omeka.site.id}
      `);
      await runSql(mysql`
        delete from site_item_set where site_id = ${data.omeka.site.id}
      `);
      await runSql(mysql`
        delete from site_setting where site_id = ${data.omeka.site.id}
      `);
      await runSql(mysql`
        delete from site where id = ${data.omeka.site.id}
      `);
      await runSql(mysql`
        insert into site (id, owner_id, slug, theme, title, navigation, item_pool, created, modified, is_public, summary) VALUES (
            ${data.omeka.site.id},  
            ${data.omeka.site.owner_id},  
            ${data.omeka.site.slug},  
            ${data.omeka.site.theme},  
            ${data.omeka.site.title},  
            ${data.omeka.site.navigation},  
            ${data.omeka.site.item_pool},  
            ${new Date(data.omeka.site.created)},  
            ${new Date(data.omeka.site.modified)},  
            ${data.omeka.site.is_public},  
            ${data.omeka.site.summary}
       )
      `);
    }

    if (data.omeka.sitePermissions.length) {
      await runSql(mysql`
        insert into site_permission (id, site_id, user_id, role) VALUES
        ${raw(
          data.omeka.sitePermissions
            .map((permission: SitePermission) => {
              return mysql`(
                  ${permission.id},  
                  ${permission.site_id},  
                  ${permission.user_id},  
                  ${permission.role}
                )`;
            })
            .join(',')
        )}
      `);
    }

    if (data.omeka.siteSettings.length) {
      await runSql(mysql`
        insert into site_setting (id, site_id, value) VALUES
        ${raw(
          data.omeka.siteSettings
            .map((permission: SiteSetting) => {
              return mysql`(
                  ${permission.id},  
                  ${permission.site_id},  
                  ${permission.value}
                )`;
            })
            .join(',')
        )}
      `);
    }
  }

  // 1. Omeka
  // 1.1 Upsert users
  await runSql(mysql`
    delete from user where id IN (${raw(data.omeka.users.map((user: User) => escape(user.id)).join(','))})
  `);
  await runSql(mysql`
    insert into user (id, email, name, created, modified, password_hash, role, is_active) VALUES
    ${raw(
      data.omeka.users
        .map((user: User) => {
          return mysql`(
            ${user.id},
            ${user.email},
            ${user.name},
            ${new Date(user.created)},
            ${user.modified ? new Date(user.modified) : user.modified},
            ${user.password_hash},
            ${user.role},
            ${user.is_active}
          )`;
        })
        .join(',')
    )}
  `);

  // IIIF resources + derivatives
  // Tasks
  // Capture models.
  // Projects.

  // Files
  // - Storage API
  // - Manifests / Canvases

  // Things to import:
  // {
  //   omeka: {
  //     site: await site,
  //       users: await users,
  //       sitePermissions: await sitePermissions,
  //       siteSettings: await siteSettings,
  //   },
  //   tasks: await tasks,
  //   captureModelIds,
  //   derivedModels: await derivedModels,
  //   models: await models,
  //   projects,
  //   iiifResources: await iiifResources,
  //   iiifMetadata: await iiifMetadata,
  //   iiifLinking: await iiifLinking,
  //   iiifDerivedResourceItems: await iiifDerivedResourceItems,
  //   iiifDerivedResources: await iiifDerivedResources,
  // }
};
