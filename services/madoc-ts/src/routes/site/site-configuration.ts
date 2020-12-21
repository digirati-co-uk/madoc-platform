import { RouteMiddleware } from '../../types/route-middleware';

export type SiteConfigurationQuery = {
  project_id?: string | number;
  page: number;
};

export const siteConfiguration: RouteMiddleware<{ slug: string }> = async context => {
  const projectId = context.query.project_id as string | undefined;
  const collectionId = context.query.collection_id as string | undefined;
  const { site, siteApi } = context.state;

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
    context.response.status = 404;
    return;
  }

  context.response.body = configResponse.config[0].config_object;
  context.response.status = 200;
};
