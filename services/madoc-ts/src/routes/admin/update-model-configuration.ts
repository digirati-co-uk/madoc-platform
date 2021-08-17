import { getProject } from '../../database/queries/project-queries';
import { MADOC_MODEL_CONFIG } from '../../extensions/capture-models/ConfigInjection/constants';
import { ConfigInjectionSettings } from '../../extensions/capture-models/ConfigInjection/types';
import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { RequestError } from '../../utility/errors/request-error';
import { parseEtag } from '../../utility/parse-etag';
import { parseProjectId } from '../../utility/parse-project-id';
import { userWithScope } from '../../utility/user-with-scope';

export const updateModelConfiguration: RouteMiddleware<unknown, Partial<ConfigInjectionSettings>> = async context => {
  const { id, siteId } = userWithScope(context, ['site.admin']);
  const site = await context.siteManager.getSiteById(siteId);

  if (!site || !site.slug) {
    throw new NotFound('Site not found');
  }

  const parsedId = context.query.project_id ? parseProjectId(context.query.project_id) : null;
  const project = parsedId ? await context.connection.one(getProject(parsedId, site.id)) : null;
  const projectId = project ? project.id : null;

  const manifestId = context.query.manifest_id ? Number(context.query.manifest_id) : null;
  const collectionId = context.query.collection_id ? Number(context.query.collection_id) : null;

  const staticConfiguration: ConfigInjectionSettings = {
    documentChanges: [],
  };

  if (Number.isNaN(manifestId) || !manifestId) {
    throw new RequestError('Invalid or missing manifest ID');
  }

  if (!projectId) {
    throw new RequestError('Can only configure models for projects');
  }

  const configRequest: string[] = [
    // Site.
    `urn:madoc:site:${site.id}`,
    // Project.
    `urn:madoc:project:${projectId}`,
  ];

  if (collectionId && !Number.isNaN(collectionId)) {
    configRequest.push(`urn:madoc:collection:${collectionId}`);
  }

  configRequest.push(`urn:madoc:manifest:${manifestId}`);

  const userApi = api.asUser({ userId: id, siteId }, { siteSlug: site.slug });

  // POST body is the configuration.
  const configurationRequest = context.requestBody;

  //  - Make query to the config service
  const rawConfigurationObject = await userApi.getConfiguration<ConfigInjectionSettings>(
    MADOC_MODEL_CONFIG,
    configRequest
  );

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
      await userApi.addConfiguration(MADOC_MODEL_CONFIG, configRequest, newConfiguration);
    } catch (err) {
      console.log('Could not save config', err);
    }
  }

  context.response.body = newConfiguration;
};
