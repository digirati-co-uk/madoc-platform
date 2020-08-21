// Lists projects, joining with metadata table, sort of like an IIIF resource.
//  - Statistics from the task service.
import { RouteMiddleware } from '../../types/route-middleware';
import { sql } from 'slonik';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { getMetadata } from '../../utility/iiif-database-helpers';
import { mapMetadata } from '../../utility/iiif-metadata';
import { ProjectList } from '../../types/schemas/project-list';
import { SQL_EMPTY } from '../../utility/postgres-tags';

export const listProjects: RouteMiddleware = async context => {
  const { siteId } = optionalUserWithScope(context, []);
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
    };
  });

  context.response.body = {
    projects: mappedProjects as any[],
    pagination: {
      page,
      totalResults: total,
      totalPages,
    },
  } as ProjectList;
};
