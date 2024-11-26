// Returns a single project.
import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { ProjectConfiguration } from '../../types/schemas/project-configuration';
import { cachePromise, cachePromiseSWR } from '../../utility/cache-helper';
import { castBool } from '../../utility/cast-bool';
import { NotFound } from '../../utility/errors/not-found';
import { parseProjectId } from '../../utility/parse-project-id';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const getProject: RouteMiddleware<{ id: string }> = async context => {
  const { siteId, siteUrn } = optionalUserWithScope(context, []);
  const userId = context.state.jwt?.user.id;
  const scope = context.state.jwt?.scope || [];
  const isAdmin = scope.indexOf('site.admin') !== -1;
  const staticConfiguration = context.externalConfig.defaultSiteConfiguration;

  const { projectSlug, projectId } = parseProjectId(context.params.id);
  const onlyPublished = isAdmin ? castBool(context.request.query.published) : true;

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

  const [content, taskStats, projectConfiguration, annotationStyles] = await Promise.all([
    userApi.getCollectionStatistics(project.collection_id),
    cachePromiseSWR(
      `task-stats:${project.task_id}`,
      () =>
        userApi.getTaskStats(project.task_id, {
          type: 'crowdsourcing-task',
          root: true,
          distinct_subjects: true,
        }),
      1000 * 60 * 15 // 15 minutes.
    ),
    userApi.getConfiguration<ProjectConfiguration>('madoc', [siteUrn, `urn:madoc:project:${project.id}`]),
    cachePromiseSWR(
      `annotation-style:${project.id}`,
      () => context.annotationStyles.getProjectAnnotationStyle(project.id, siteId),
      1000 * 60 * 15 // 15 minutes.
    ),
  ]);

  const taskStatuses = taskStats.statuses || {};

  let config;
  if (projectConfiguration.config && projectConfiguration.config[0] && projectConfiguration.config[0].config_object) {
    config = { ...staticConfiguration, ...projectConfiguration.config[0].config_object };
  } else {
    config = staticConfiguration;
  }

  const countManifests = config.shadow?.showCaptureModelOnManifest;

  const isProjectMember = userId ? await context.projects.isUserProjectMember(userId, project.id) : false;

  statistics['0'] = countManifests ? content.manifests - taskStats.total : content.canvases - taskStats.total;
  statistics['1'] = taskStatuses['1'] || 0;
  statistics['2'] = taskStatuses['2'] || 0;
  statistics['3'] = taskStatuses['3'] || 0;

  context.response.body = {
    ...project,
    statistics,
    isProjectMember,
    content,
    config,
    annotationTheme: annotationStyles ? annotationStyles.theme : null,
  };
};
