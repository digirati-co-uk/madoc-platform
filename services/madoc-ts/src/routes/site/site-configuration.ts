import { getProject } from '../../database/queries/project-queries';
import { RouteMiddleware } from '../../types/route-middleware';
import { castBool } from '../../utility/cast-bool';
import { parseProjectId } from '../../utility/parse-project-id';

export type SiteConfigurationQuery = {
  project_id?: string | number;
  collection_id?: number;
  show_source?: string | boolean;
};

export const siteConfiguration: RouteMiddleware<{ slug: string }> = async context => {
  const collectionId = context.query.collection_id;
  const { site, siteApi } = context.state;

  const parsedId = context.query.project_id ? parseProjectId(context.query.project_id) : null;
  const project = parsedId ? await context.connection.one(getProject(parsedId, site.id)) : null;
  const projectId = project ? project.id : null;
  const showSource = castBool(context.query.show_source || '');

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

  const resolvedConfig = { ...staticConfiguration, ...configResponse.config[0].config_object };

  if (showSource) {
    // Better merging, to show which values are coming from where.
    const sources: Record<'staticConfig' | 'siteConfig', Array<{ property: string; original: any; override: any }>> = {
      staticConfig: [],
      siteConfig: [],
    };

    if (configRequest.length > 1) {
      const siteConfig = await siteApi.getConfiguration('madoc', [`urn:madoc:site:${site.id}`]);
      if (siteConfig && siteConfig.config && siteConfig.config[0]) {
        // Need to diff the config.
        const siteConfigObject = siteConfig.config[0].config_object;
        for (const key of Object.keys(siteConfigObject)) {
          const value = siteConfigObject[key];
          if (JSON.stringify(value) !== JSON.stringify(resolvedConfig[key])) {
            sources.siteConfig.push({ property: key, original: resolvedConfig[key], override: value });
          }
        }
      }

      // Same thing for staticConfig.
      for (const key of Object.keys(staticConfiguration)) {
        const value = (staticConfiguration as any)[key];
        if (
          JSON.stringify(value) !== JSON.stringify(resolvedConfig[key]) &&
          !sources.siteConfig.find(s => s.property === key)
        ) {
          sources.staticConfig.push({ property: key, original: resolvedConfig[key], override: value });
        }
      }
    }

    resolvedConfig._source = sources;
  }

  context.response.body = resolvedConfig;
  context.response.status = 200;
};
