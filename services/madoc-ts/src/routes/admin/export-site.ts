import { sql } from 'slonik';
import { api } from '../../gateway/api.server';
import { Site } from '../../types/omeka/Site';
import { SitePermission } from '../../types/omeka/SitePermission';
import { SiteSetting } from '../../types/omeka/SiteSetting';
import { User } from '../../types/omeka/User';
import { RouteMiddleware } from '../../types/route-middleware';
import AdmZip from 'adm-zip';
import { mysql } from '../../utility/mysql';
import { userWithScope } from '../../utility/user-with-scope';

export const exportSite: RouteMiddleware = async context => {
  // @todo add option to reset passwords to testable default. Tests should assume a standard password.
  const { siteId } = userWithScope(context, ['site.admin']);
  // const zip = new AdmZip();

  // - Grab Omeka tables as JSON

  //    - Get the site
  const site = new Promise<Site>(resolve =>
    context.mysql.query(mysql`select * from site where site.id = ${siteId}`, (err, data) => {
      resolve(data[0]);
    })
  );

  //    - All users that are part of the site
  const users = new Promise<User[]>(resolve =>
    context.mysql.query(
      mysql`
        select user.* from user left join site_permission sp on user.id = sp.user_id where sp.site_id = ${siteId}
    `,
      (err, data) => {
        resolve(data);
      }
    )
  );

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
  const iiifLinking = context.connection.any(sql`select * from iiif_linking where site_id = ${siteId}`);

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
  const tasks = await siteApi.request(`/api/tasks/export-all`);

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

  //    - Export as static JSON - using list from projects
  // - Grab static files (storage api + manifests? how?)
  //    - Storage API folder for site
  //    - List of local source files from db - save to relative path

  // Download zip.
  // context.response.body = zip.toBuffer();

  context.response.body = {
    omeka: {
      site: await site,
      users: await users,
      sitePermissions: await sitePermissions,
      siteSettings: await siteSettings,
    },
    tasks: await tasks,
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
