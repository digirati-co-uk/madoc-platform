import { getProject } from '../../database/queries/project-queries';
import { MADOC_MODEL_CONFIG } from '../../extensions/capture-models/ConfigInjection/constants';
import { ConfigInjectionSettings } from '../../extensions/capture-models/ConfigInjection/types';
import { api } from '../../gateway/api.server';
import { Site } from '../../types/omeka/Site';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { RequestError } from '../../utility/errors/request-error';
import { mysql } from '../../utility/mysql';
import { parseProjectId } from '../../utility/parse-project-id';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const getModelConfiguration: RouteMiddleware<{ slug: string }> = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.admin']);
  const site = await new Promise<Site>(resolve =>
    context.mysql.query(mysql`select * from site where site.id = ${siteId}`, (err, data) => {
      resolve(data[0]);
    })
  );

  if (!site || !site.slug) {
    throw new NotFound('Site not found');
  }

  const siteApi = api.asUser({ siteId }, { siteSlug: site.slug });

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
