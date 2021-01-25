import { FacetConfig } from '../../frontend/shared/components/MetadataFacetEditor';
import { api } from '../../gateway/api.server';
import { Site } from '../../types/omeka/Site';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { mysql } from '../../utility/mysql';
import { parseEtag } from '../../utility/parse-etag';
import { userWithScope } from '../../utility/user-with-scope';

export const getFacetConfiguration: RouteMiddleware = async context => {
  const projectId = context.query.project_id as string | undefined;
  const collectionId = context.query.collection_id as string | undefined;
  const { site, siteApi } = context.state;

  const defaultConfiguration = { facets: [] };

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

  const configResponse = await siteApi.getConfiguration<{ facets: FacetConfig[] }>('search-facets', configRequest);

  if (!configResponse || !configResponse.config || !configResponse.config[0]) {
    context.response.body = defaultConfiguration;
    context.response.status = 200;
    return;
  }

  context.response.body = { ...defaultConfiguration, ...configResponse.config[0].config_object };
  context.response.status = 200;
};

export const updateFacetConfiguration: RouteMiddleware = async context => {
  // @todo updating different scopes.
  const { id, siteId } = userWithScope(context, ['site.admin']);
  const staticConfiguration = { facets: [] };

  const site = await new Promise<Site>(resolve =>
    context.mysql.query(mysql`select * from site where site.id = ${siteId}`, (err, data) => {
      resolve(data[0]);
    })
  );

  if (!site || !site.slug) {
    throw new NotFound('Site not found');
  }

  const userApi = api.asUser({ userId: id, siteId }, { siteSlug: site.slug });

  // POST body is the configuration.
  const configurationRequest = context.requestBody;

  //  - Make query to the config service
  const rawConfigurationObject = await userApi.getConfiguration<{ facets: FacetConfig[] }>('search-facets', [
    `urn:madoc:site:${siteId}`,
  ]);

  const oldConfiguration = rawConfigurationObject.config[0];

  const newConfiguration = {
    ...staticConfiguration,
    ...(oldConfiguration ? oldConfiguration.config_object : {}),
    ...configurationRequest,
  };

  if (oldConfiguration && oldConfiguration.id) {
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
      await userApi.addConfiguration('search-facets', [`urn:madoc:site:${siteId}`], newConfiguration);
    } catch (err) {
      console.log('Could not save config', err);
    }
  }

  context.response.body = newConfiguration;
};
