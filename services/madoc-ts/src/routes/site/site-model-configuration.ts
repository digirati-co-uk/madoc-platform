import { getProject } from '../../database/queries/project-queries';
import { MADOC_MODEL_CONFIG } from '../../extensions/capture-models/ConfigInjection/constants';
import { ConfigInjectionSettings } from '../../extensions/capture-models/ConfigInjection/types';
import { RouteMiddleware } from '../../types/route-middleware';
import { RequestError } from '../../utility/errors/request-error';
import { parseProjectId } from '../../utility/parse-project-id';

export type SiteModelConfigurationQuery = {
  manifest_id: number;
  project_id: string | number;
  collection_id?: number;
};

export const siteModelConfiguration: RouteMiddleware<{ slug: string }> = async context => {
  const { site, siteApi } = context.state;

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

  const configResponse = await siteApi.getConfiguration(MADOC_MODEL_CONFIG, configRequest);

  if (!configResponse || !configResponse.config || !configResponse.config[0]) {
    context.response.body = staticConfiguration;
    context.response.status = 200;
    return;
  }

  context.response.body = { ...staticConfiguration, ...configResponse.config[0].config_object };
  context.response.status = 200;
};
