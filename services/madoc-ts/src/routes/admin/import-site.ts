import { CaptureModel } from '@capture-models/types';
import * as fs from 'fs';
import mkdirp from 'mkdirp';
import * as path from 'path';
import { sql } from 'slonik';
import { api } from '../../gateway/api.server';
import { fileDirectory } from '../../gateway/tasks/task-helpers';
import { SitePermission } from '../../types/omeka/SitePermission';
import { SiteSetting } from '../../types/omeka/SiteSetting';
import { User } from '../../types/omeka/User';
import { RouteMiddleware } from '../../types/route-middleware';
import { CaptureModelSnippet } from '../../types/schemas/capture-model-snippet';
import { NotFound } from '../../utility/errors/not-found';
import { raw, mysql } from '../../utility/mysql';
import { inserts, upsert } from '../../utility/slonik-helpers';
import { userWithScope } from '../../utility/user-with-scope';

export const importSite: RouteMiddleware = async context => {
  // This is ONLY for test environments for now.
  if (process.env.NODE_ENV !== 'test') {
    throw new NotFound();
  }

  const { siteId } = userWithScope(context, ['site.admin']);
  const siteApi = api.asUser({ siteId });

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
    // 1. Omeka
    // 1.1 Upsert users
    // await runSql(mysql`
    //   delete from user where id IN (${raw(data.omeka.users.map((user: User) => escape(user.id)).join(','))})
    // `);
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
    on duplicate key update 
      email=VALUES(email), 
      name=VALUES(name), 
      created=VALUES(created), 
      modified=VALUES(modified), 
      password_hash=VALUES(password_hash), 
      role=VALUES(role), 
      is_active=VALUES(is_active)
  `);
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

  // IIIF resources + derivatives

  //Tasks - write custom import in task service.
  if (data.tasks && data.tasks.tasks && data.tasks.tasks.length) {
    await siteApi.request(`/api/tasks/import?clear_context=true`, {
      body: data.tasks,
      method: 'POST',
    });
  }

  // // Capture models - slow and steady.
  if (data.models && data.models.length) {
    if (data.derivedModels && data.derivedModels.length) {
      const derivedModelsToDelete: Array<CaptureModel | CaptureModelSnippet>[] = [...data.derivedModels];

      // Remove all existing derived models.
      try {
        await Promise.all(
          data.models.map(async (model: CaptureModel) => {
            try {
              const id = model.id;
              const derived = await siteApi.getAllCaptureModels({ all_derivatives: true, derived_from: id });
              derivedModelsToDelete.push(derived);
            } catch (e) {
              // could already have been deleted.
            }
          })
        );
      } catch (e) {
        // ..
      }

      // Import derived models.
      await Promise.all(
        derivedModelsToDelete.map(models => {
          return Promise.all(
            models.map(async model => {
              if (model.id) {
                try {
                  const originalModel = await siteApi.getCaptureModel(model.id);
                  const revisions = originalModel.revisions || [];
                  for (const revision of revisions) {
                    try {
                      await siteApi.deleteCaptureModelRevision(revision.id);
                    } catch (err) {
                      // could already have been deleted.
                    }
                  }
                  try {
                    await siteApi.deleteCaptureModel(model.id);
                  } catch (err) {
                    // Might have already been deleted.
                  }
                } catch (err) {
                  /// ...
                }
              }
            })
          );
        })
      );
    }
    // Import base models.
    await Promise.all(
      data.models.map(async (model: CaptureModel) => {
        if (model.id) {
          const revisions = model.revisions || [];
          for (const revision of revisions) {
            try {
              await siteApi.deleteCaptureModelRevision(revision.id);
            } catch (err) {
              // could already have been deleted.
            }
          }
          try {
            await siteApi.deleteCaptureModel(model.id);
          } catch (err) {
            // Might have already been deleted.
          }
          try {
            await siteApi.importCaptureModel(model);
          } catch (err) {
            // @todo Can fail... need to keep an eye on this.
          }
        }
      })
    );
    if (data.derivedModels && data.derivedModels.length) {
      // Import derived models.
      await Promise.all(
        data.derivedModels.map((models: CaptureModel[]) => {
          return Promise.all(
            models.map(async (model: CaptureModel) => {
              if (model.id) {
                try {
                  await siteApi.importCaptureModel(model);
                } catch (err) {
                  // Might have already been deleted.
                }
              }
            })
          );
        })
      );
    }
  }

  // Projects - Postgres import
  if (data.iiifResources && data.iiifResources.length) {
    await context.connection.query(sql`
        insert into iiif_resource (id, type, source, local_source, rights, viewing_direction, nav_date, height, width,
                                   duration, default_thumbnail) values
            ${inserts(
              data.iiifResources.map((resource: any) => {
                return sql`${sql.join(
                  [
                    resource.id,
                    resource.type,
                    resource.source,
                    resource.local_source,
                    resource.rights,
                    resource.viewing_direction,
                    resource.nav_date,
                    resource.height,
                    resource.width,
                    resource.duration,
                    resource.default_thumbnail,
                  ],
                  sql`,`
                )}`;
              })
            )}
             on conflict do nothing;
    `);
  }

  if (data.iiifMetadata && data.iiifMetadata.length) {
    await context.connection.query(
      upsert(
        'iiif_metadata',
        ['id'],
        data.iiifMetadata,
        [
          'id',
          'key',
          'value',
          'language',
          'source',
          'resource_id',
          'site_id',
          'readonly',
          'edited',
          'auto_update',
          'data',
        ],
        {
          jsonKeys: ['data'],
        }
      )
    );
  }

  if (data.iiifLinking && data.iiifLinking.length) {
    await context.connection.query(
      upsert(
        'iiif_linking',
        ['id'],
        data.iiifLinking,
        [
          'id',
          'uri',
          'label',
          'property',
          'source',
          'file_path',
          'file_bucket',
          'motivation',
          'format',
          'properties',
          'modified_at',
          'created_at',
          'site_id',
          'resource_id',
          'type',
        ],
        {
          jsonKeys: ['properties'],
          dateKeys: ['created_at', 'modified_at'],
        }
      )
    );
    await context.connection.query(
      sql`delete from iiif_linking where site_id = ${siteId} and not (id = any (${sql.array(
        data.iiifLinking.map((item: any) => item.id),
        sql`int[]`
      )}))`
    );
  }

  if (data.iiifDerivedResources && data.iiifDerivedResources.length) {
    await context.connection.query(
      upsert(
        'iiif_derived_resource',
        ['id'],
        data.iiifDerivedResources,
        [
          'id',
          'site_id',
          'resource_type',
          'resource_id',
          'created_at',
          'created_by',
          'slug',
          'task_id',
          'task_complete',
          'flat',
        ],
        {
          jsonKeys: ['properties'],
          dateKeys: ['created_at', 'modified_at'],
        }
      )
    );
    // @todo could do this for more upserts.
    await context.connection.query(
      sql`delete from iiif_derived_resource where site_id = ${siteId} and not (id = any (${sql.array(
        data.iiifDerivedResources.map((item: any) => item.id),
        sql`int[]`
      )}))`
    );
  }
  if (data.iiifDerivedResourceItems && data.iiifDerivedResourceItems.length) {
    await context.connection.query(
      upsert('iiif_derived_resource_items', ['resource_id', 'item_id', 'site_id'], data.iiifDerivedResourceItems, [
        'resource_id',
        'item_id',
        'item_index',
        'site_id',
      ])
    );
    // @todo delete extras: where resource_id::text || item_id::text || site_id::text = '1372011'
  }

  if (data.projects && data.projects.length) {
    await context.connection.query(
      upsert('iiif_project', ['id'], data.projects, [
        'id',
        'task_id',
        'collection_id',
        'slug',
        'site_id',
        'capture_model_id',
        'status',
      ])
    );
  }

  if (data.files && data.files.resources) {
    const resources: Array<{ data: any; source: string }> = data.files.resources;
    for (const resource of resources) {
      if (resource) {
        const filePath = path.join(fileDirectory, resource.source);
        if (!fs.existsSync(filePath)) {
          mkdirp.sync(`${path.dirname(filePath)}`);
          fs.writeFileSync(filePath, JSON.stringify(resource.data));
        }
      }
    }
  }

  if (data.files && data.files.linkingStorage) {
    const resources: Array<{ data: any; bucket: string; path: string }> = data.files.linkingStorage;
    for (const resource of resources) {
      try {
        await siteApi.getStorageJsonDetails(resource.bucket, resource.path);
      } catch (e) {
        await siteApi.saveStorageJson(resource.bucket, resource.path, resource.data);
      }
    }
  }

  // Files
  // - Storage API
  // Search
  // - Full search ingest.

  context.response.status = 200;
};
