import { api } from '../../gateway/api.server';
import { Site } from '../../types/omeka/Site';
import { RouteMiddleware } from '../../types/route-middleware';
import { ProjectConfiguration } from '../../types/schemas/project-configuration';
import { NotFound } from '../../utility/errors/not-found';
import { mysql } from '../../utility/mysql';
import { parseEtag } from '../../utility/parse-etag';
import { userWithScope } from '../../utility/user-with-scope';

export const updateSiteConfiguration: RouteMiddleware<{}, Partial<ProjectConfiguration>> = async context => {
  const { id, siteId } = userWithScope(context, ['site.admin']);
  const staticConfiguration = context.externalConfig.defaultSiteConfiguration;

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
  const rawConfigurationObject = await userApi.getConfiguration<ProjectConfiguration>('madoc', [
    `urn:madoc:site:${siteId}`,
  ]);

  const oldConfiguration = rawConfigurationObject.config[0];

  const newConfiguration = { ...staticConfiguration, ...oldConfiguration.config_object, ...configurationRequest };

  if (oldConfiguration.id) {
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
      await userApi.addConfiguration('madoc', [`urn:madoc:site:${siteId}`], newConfiguration);
    } catch (err) {
      console.log('Could not save config', err);
    }
  }

  context.response.body = newConfiguration;
};
