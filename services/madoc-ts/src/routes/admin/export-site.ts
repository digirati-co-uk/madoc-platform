import * as fs from 'fs';
import * as path from 'path';
import { sql } from 'slonik';
import { ResourceLinkRow } from '../../database/queries/linking-queries';
import { api } from '../../gateway/api.server';
import { Site } from '../../types/omeka/Site';
import { SitePermission } from '../../types/omeka/SitePermission';
import { SiteSetting } from '../../types/omeka/SiteSetting';
import { User } from '../../types/omeka/User';
import { RouteMiddleware } from '../../types/route-middleware';
import { mysql } from '../../utility/mysql';
import { userWithScope } from '../../utility/user-with-scope';

export const fileDirectory = process.env.OMEKA_FILE_DIRECTORY || '/home/node/app/omeka-files';

export const exportSite: RouteMiddleware = async context => {
  // @todo add option to reset passwords to testable default. Tests should assume a standard password.
  const { siteId } = userWithScope(context, ['site.admin']);

  // - Grab Omeka tables as JSON
  //    - Get the site
  const site = new Promise<Site>(resolve =>
    context.mysql.query(mysql`select * from site where site.id = ${siteId}`, (err, data) => {
      resolve(data[0]);
    })
  );

  //    - All users that are part of the site
  const users = await new Promise<User[]>(resolve =>
    context.mysql.query(
      mysql`
        select user.* from user left join site_permission sp on user.id = sp.user_id where sp.site_id = ${siteId}
    `,
      (err, data) => {
        resolve(data);
      }
    )
  );

  for (const user of users) {
    user.password_hash = '$2y$10$EAaqhorjdNKLea6OwZLNZeQA0zqyMlJfLuaGNSWIxT9nI3wL33rV2'; // Testpass123_ (for testing)
  }

  //    - Site permissions
  const sitePermissions = new Promise<SitePermission[]>(resolve =>
    context.mysql.query(
      mysql`
        select * from site_permission where site_id = ${siteId}
    `,
      (err, data) => {
        resolve(data);
      }
    )
  );

  //    - Site settings
  const siteSettings = new Promise<SiteSetting[]>(resolve =>
    context.mysql.query(
      mysql`
        select * from site_setting where site_id = ${siteId}
    `,
      (err, data) => {
        resolve(data);
      }
    )
  );

  // - Grab madoc-ts tables (where site = blah)
  //    - IIIF derived resources
  const iiifDerivedResources = context.connection.any(
    sql`select * from iiif_derived_resource where site_id = ${siteId}`
  );

  //    - IIIF derived resource items
  const iiifDerivedResourceItems = context.connection.any(
    sql`select * from iiif_derived_resource_items where site_id = ${siteId}`
  );

  //    - IIIF linking
  const iiifLinking = context.connection.any<ResourceLinkRow>(
    sql`select * from iiif_linking where site_id = ${siteId}`
  );

  //    - IIIF metadata
  const iiifMetadata = context.connection.any(sql`select * from iiif_metadata where site_id = ${siteId}`);

  //    - IIIF resources (matching derived resources)
  const iiifResources = context.connection.any(
    sql`select iiif_resource.* from iiif_resource left join iiif_derived_resource idr on iiif_resource.id = idr.resource_id where site_id = ${siteId}`
  );
  //    - Projects
  const projects = await context.connection.any(sql`select * from iiif_project where site_id = ${siteId}`);

  const siteApi = api.asUser({ siteId });

  // - Grab tasks tables (where site = blah)
  const blacklistTypes = [
    'madoc-manifest-import',
    'madoc-canvas-import',
    'madoc-collection-import',
    'search-index-task',
    'madoc-ocr-manifest',
    'canvas-ocr-manifest',
  ];
  const tasks = await siteApi.request(`/api/tasks/export-all`);
  const tasksToSave = (tasks as any).tasks.filter((t: any) => blacklistTypes.indexOf(t.type) === -1);

  // - Grab capture models (get from projects)
  // @todo optimise this into a single operation in the model service.
  const captureModelIds = projects.map(project => project.capture_model_id);

  const models = Promise.all(captureModelIds.map(id => siteApi.getCaptureModel(id as string)));
  const derivedModelSnippets = await Promise.all(
    captureModelIds.map(id => siteApi.getAllCaptureModels({ derived_from: id as string }))
  );
  const derivedModels = Promise.all(
    derivedModelSnippets.map(ids => Promise.all(ids.map(snippet => siteApi.getCaptureModel(snippet.id))))
  );

  // - Grab static files (storage api + manifests? how?)
  //    - Storage API folder for site
  //    - List of local source files from db - save to relative path

  const loadedIIIIFResource = await iiifResources;

  // Files to be saved.
  // - Manifests
  const resources = loadedIIIIFResource.map(resource => {
    try {
      if (resource.local_source && typeof resource.local_source === 'string') {
        const data = JSON.parse(fs.readFileSync(resource.local_source).toString());
        return {
          data,
          source: path.relative(fileDirectory, resource.local_source as string),
        };
      }
    } catch (err) {
      // no-op
    }
  });

  const loadedLinking = await iiifLinking;
  const linkingStorage = [];
  for (const linkingProperty of loadedLinking) {
    // White-list this as we go.
    if (linkingProperty.file_bucket && linkingProperty.file_path && linkingProperty.format === 'application/json') {
      linkingStorage.push({
        data: await siteApi.getStorageJsonData(linkingProperty.file_bucket, linkingProperty.file_path),
        bucket: linkingProperty.file_bucket,
        path: linkingProperty.file_path,
        format: 'json',
      });
    }
  }

  // - Canvas OCR

  context.response.body = {
    omeka: {
      site: await site,
      users: await users,
      sitePermissions: await sitePermissions,
      siteSettings: await siteSettings,
    },
    files: {
      resources,
      linkingStorage,
    },
    tasks: { tasks: tasksToSave },
    captureModelIds,
    derivedModels: await derivedModels,
    models: await models,
    projects,
    iiifResources: await iiifResources,
    iiifMetadata: await iiifMetadata,
    iiifLinking: await iiifLinking,
    iiifDerivedResourceItems: await iiifDerivedResourceItems,
    iiifDerivedResources: await iiifDerivedResources,
  };
};
