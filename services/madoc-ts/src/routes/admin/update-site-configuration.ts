import { getProject } from '../../database/queries/project-queries';
import { api } from '../../gateway/api.server';
import { Site } from '../../types/omeka/Site';
import { RouteMiddleware } from '../../types/route-middleware';
import { ProjectConfiguration } from '../../types/schemas/project-configuration';
import { NotFound } from '../../utility/errors/not-found';
import { mysql } from '../../utility/mysql';
import { parseEtag } from '../../utility/parse-etag';
import { parseProjectId } from '../../utility/parse-project-id';
import { userWithScope } from '../../utility/user-with-scope';

export const updateSiteConfiguration: RouteMiddleware<{}, Partial<ProjectConfiguration>> = async context => {
  const { id, siteId } = userWithScope(context, ['site.admin']);
  const collectionId = context.query.collection_id as string | undefined;
  const staticConfiguration = context.externalConfig.defaultSiteConfiguration;

  const site = await new Promise<Site>(resolve =>
    context.mysql.query(mysql`select * from site where site.id = ${siteId}`, (err, data) => {
      resolve(data[0]);
    })
  );

  const parsedId = context.query.project_id ? parseProjectId(context.query.project_id) : null;
  const project = parsedId ? await context.connection.maybeOne(getProject(parsedId, site.id)) : null;
  const projectId = project ? project.id : null;

  if (!site || !site.slug) {
    throw new NotFound('Site not found');
  }

  const configRequest: string[] = [`urn:madoc:site:${site.id}`];

  if (projectId) {
    // @todo possibly resolve project ID from slug?
    configRequest.push(`urn:madoc:project:${projectId}`);
  }

  if (collectionId) {
    configRequest.push(`urn:madoc:collection:${collectionId}`);
  }

  const userApi = api.asUser({ userId: id, siteId }, { siteSlug: site.slug });

  // POST body is the configuration.
  const configurationRequest = context.requestBody;

  //  - Make query to the config service
  const rawConfigurationObject = await userApi.getConfiguration<ProjectConfiguration>('madoc', configRequest);

  const oldConfiguration = rawConfigurationObject.config[0];

  const newConfiguration = {
    ...staticConfiguration,
    ...(oldConfiguration ? oldConfiguration.config_object : {}),
    ...configurationRequest,
  };

  // Is it the same context?
  const isEqual =
    oldConfiguration &&
    oldConfiguration.scope &&
    oldConfiguration.scope.length === configRequest.length &&
    oldConfiguration.scope.every(val => configRequest.includes(val));

  if (isEqual && oldConfiguration && oldConfiguration.id) {
    const rawConfiguration = await userApi.getSingleConfigurationRaw(oldConfiguration.id);
    const etagHeader = rawConfiguration.headers.get('etag');
    const etag = etagHeader ? parseEtag(etagHeader.toString()) : undefined;

    if (etag) {
      //  - If it exists, then grab the UUID and update that resource
      await userApi.replaceConfiguration(oldConfiguration.id, etag, newConfiguration);
    }
  } else {
    try {
      //  - If it does not exist, then POST the new configuration.
      await userApi.addConfiguration('madoc', configRequest, newConfiguration);
    } catch (err) {
      console.log('Could not save config', err);
    }
  }

  context.response.body = newConfiguration;
};
