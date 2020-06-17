// Lists projects, joining with metadata table, sort of like an IIIF resource.
//  - Statistics from the task service.
import { RouteMiddleware } from '../../types/route-middleware';
import { sql } from 'slonik';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { api } from '../../gateway/api.server';
import { getMetadata } from '../../utility/iiif-database-helpers';
import { mapMetadata } from '../../utility/iiif-metadata';
import { ProjectList } from '../../types/schemas/project-list';
import { ProjectListItem } from '../../types/schemas/project-list-item';
import { InternationalString } from '@hyperion-framework/types';
import { SQL_EMPTY } from '../../utility/postgres-tags';

export const listProjects: RouteMiddleware = async context => {
  const { id, siteId, siteUrn } = optionalUserWithScope(context, []);

  const page = Number(context.query.page) || 1;
  const rootTaskId = context.query.root_task_id;
  const projectsPerPage = 5;

  const rootTaskQuery = rootTaskId ? sql`and iiif_project.task_id = ${rootTaskId}` : SQL_EMPTY;

  const { total } = await context.connection.one(
    sql`
      select count(*) as total 
      from iiif_project
      where site_id = ${siteId}
      ${rootTaskQuery}
    `
  );
  const totalPages = Math.ceil(total / projectsPerPage);

  const projects = await context.connection.any(
    getMetadata<{ resource_id: number; project_id: number }>(
      sql`
        select *, collection_id as resource_id, iiif_project.id as project_id from iiif_project 
            left join iiif_resource ir on iiif_project.collection_id = ir.id
        where site_id = ${siteId}
        ${rootTaskQuery}
        limit ${projectsPerPage} offset ${(page - 1) * projectsPerPage}
      `,
      siteId
    )
  );

  const mappedProjects = mapMetadata(projects, project => {
    return {
      id: project.project_id,
      collection_id: project.id,
      slug: project.slug,
      capture_model_id: project.capture_model_id,
      task_id: project.task_id,
      statistics: {
        '0': 0,
        '1': 0,
        '2': 0,
        '3': 0,
      },
    };
  });

  for (const project of mappedProjects) {
    project.statistics = {
      ...project.statistics,
      ...((await api.getTaskStats(project.task_id as string)).statuses || ({} as any)),
    } as any;

    const config = await api.getConfiguration('madoc', [`urn:madoc:project:${project.id}`, siteUrn]);

    project.config =
      config && config.config && config.config[0] && config.config[0].config_object
        ? config.config[0].config_object
        : {};

    // project.model = (await api.asUser({ userId: id, siteId }).getCaptureModel(project.capture_model_id as any)) as any;
  }

  context.response.body = {
    projects: mappedProjects as any[],
    pagination: {
      page,
      totalResults: total,
      totalPages,
    },
  } as ProjectList;
};
