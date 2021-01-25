import { getProject } from '../../database/queries/project-queries';
import { RouteMiddleware } from '../../types/route-middleware';
import { parseProjectId } from '../../utility/parse-project-id';

export type SiteConfigurationQuery = {
  project_id?: string | number;
  collection_id?: number;
};

export const siteConfiguration: RouteMiddleware<{ slug: string }> = async context => {
  const collectionId = context.query.collection_id;
  const { site, siteApi } = context.state;

  const parsedId = context.query.project_id ? parseProjectId(context.query.project_id) : null;
  const project = parsedId ? await context.connection.one(getProject(parsedId, site.id)) : null;
  const projectId = project ? project.id : null;

  const staticConfiguration = context.externalConfig.defaultSiteConfiguration;

  if (site.is_public) {
    // @todo Try serving cached response.
  }

  const configRequest: string[] = [`urn:madoc:site:${site.id}`];

  if (projectId) {
    // @todo possibly resolve project ID from slug?
    configRequest.push(`urn:madoc:project:${projectId}`);
  }
  if (collectionId) {
    configRequest.push(`urn:madoc:collection:${collectionId}`);
  }

  const configResponse = await siteApi.getConfiguration('madoc', configRequest);

  if (!configResponse || !configResponse.config || !configResponse.config[0]) {
    // @todo should we load the default configuration?
    context.response.body = staticConfiguration;
    context.response.status = 200;
    return;
  }

  context.response.body = { ...staticConfiguration, ...configResponse.config[0].config_object };
  context.response.status = 200;
};
