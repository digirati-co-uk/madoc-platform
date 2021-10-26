// Returns a single project.
import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { ProjectConfiguration } from '../../types/schemas/project-configuration';
import { castBool } from '../../utility/cast-bool';
import { NotFound } from '../../utility/errors/not-found';
import { parseProjectId } from '../../utility/parse-project-id';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const getProject: RouteMiddleware<{ id: string }> = async context => {
  const { siteId, siteUrn } = optionalUserWithScope(context, []);
  const scope = context.state.jwt?.scope || [];
  const staticConfiguration = context.externalConfig.defaultSiteConfiguration;

  const { projectSlug, projectId } = parseProjectId(context.params.id);
  const onlyPublished = scope.indexOf('site.admin') !== -1 ? castBool(context.request.query.published) : true;

  if (!projectId && !projectSlug) {
    throw new NotFound();
  }

  const userApi = api.asUser({ siteId });
  const project = await context.projects.getProjectByIdOrSlug(context.params.id, siteId, onlyPublished);

  const statistics = {
    '0': 0,
    '1': 0,
    '2': 0,
    '3': 0,
  } as any;

  const [content, taskStats, projectConfiguration] = await Promise.all([
    userApi.getCollectionStatistics(project.collection_id),
    userApi.getTaskStats(project.task_id, {
      type: 'crowdsourcing-task',
      root: true,
      distinct_subjects: true,
    }),
    userApi.getConfiguration<ProjectConfiguration>('madoc', [siteUrn, `urn:madoc:project:${project.id}`]),
  ]);

  const taskStatuses = taskStats.statuses || {};

  statistics['0'] = content.canvases - taskStats.total;
  statistics['1'] = taskStatuses['1'] || 0;
  statistics['2'] = taskStatuses['2'] || 0;
  statistics['3'] = taskStatuses['3'] || 0;

  let config;
  if (projectConfiguration.config && projectConfiguration.config[0] && projectConfiguration.config[0].config_object) {
    config = { ...staticConfiguration, ...projectConfiguration.config[0].config_object };
  } else {
    config = staticConfiguration;
  }

  context.response.body = {
    ...project,
    statistics,
    content,
    config,
  };
};
