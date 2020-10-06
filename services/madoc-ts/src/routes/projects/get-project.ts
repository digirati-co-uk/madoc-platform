// Returns a single project.
import { RouteMiddleware } from '../../types/route-middleware';
import { castBool } from '../../utility/cast-bool';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { getMetadata } from '../../utility/iiif-database-helpers';
import { sql } from 'slonik';
import { mapMetadata } from '../../utility/iiif-metadata';
import { api } from '../../gateway/api.server';
import { NotFound } from '../../utility/errors/not-found';
import { SQL_EMPTY } from '../../utility/postgres-tags';
import { parseProjectId } from '../../utility/parse-project-id';
import { ProjectConfiguration } from '../../types/schemas/project-configuration';

export const getProject: RouteMiddleware<{ id: string }> = async context => {
  const { id, siteId, siteUrn } = optionalUserWithScope(context, []);
  const scope = context.state.jwt?.scope || [];

  const { projectSlug, projectId } = parseProjectId(context.params.id);
  const onlyPublished = scope.indexOf('site.admin') !== -1 ? castBool(context.request.query.published) : true;

  if (!projectId && !projectSlug) {
    throw new NotFound();
  }

  const userApi = api.asUser({ siteId });

  const projects = await context.connection.many(
    getMetadata<{ resource_id: number; project_id: number }>(
      sql`
        select *, collection_id as resource_id, iiif_project.id as project_id from iiif_project 
            left join iiif_resource ir on iiif_project.collection_id = ir.id
        where site_id = ${siteId} 
          ${projectId ? sql`and iiif_project.id = ${projectId}` : SQL_EMPTY}
          ${projectSlug ? sql`and iiif_project.slug = ${projectSlug}` : SQL_EMPTY}
          ${onlyPublished ? sql`and (iiif_project.status = 1 or iiif_project.status = 2)` : SQL_EMPTY}
      `,
      siteId
    )
  );

  const mappedProjects = mapMetadata(projects, project => {
    return {
      id: project.project_id,
      slug: project.slug,
      capture_model_id: project.capture_model_id,
      collection_id: project.id,
      task_id: project.task_id,
      status: project.status,
    };
  });

  const project = mappedProjects[0];

  const statistics = {
    '0': 0,
    '1': 0,
    '2': 0,
    '3': 0,
  } as any;

  const collectionStats = await userApi.getCollectionStatistics(project.collection_id);
  const taskStats = await userApi.getTaskStats(project.task_id, {
    type: 'crowdsourcing-task',
    root: true,
    distinct_subjects: true,
  });
  const taskStatuses = taskStats.statuses || {};

  statistics['0'] = collectionStats.canvases - taskStats.total;
  statistics['1'] = taskStatuses['1'] || 0;
  statistics['2'] = taskStatuses['2'] || 0;
  statistics['3'] = taskStatuses['3'] || 0;

  project.statistics = statistics;

  project.content = collectionStats as any;

  project.config = ((await userApi.getConfiguration<ProjectConfiguration>('madoc', [
    `urn:madoc:project:${project.id}`,
    siteUrn,
  ])) as any).config[0].config_object;

  //  project.model = (await api.asUser({ userId: id, siteId }).getCaptureModel(project.capture_model_id as any)) as any;

  context.response.body = project;
};
