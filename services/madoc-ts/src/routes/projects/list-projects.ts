// Lists projects, joining with metadata table, sort of like an IIIF resource.
//  - Statistics from the task service.
import { RouteMiddleware } from '../../types/route-middleware';
import { sql } from 'slonik';
import { castBool } from '../../utility/cast-bool';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { getMetadata } from '../../utility/iiif-database-helpers';
import { mapMetadata } from '../../utility/iiif-metadata';
import { ProjectList } from '../../types/schemas/project-list';
import { SQL_EMPTY } from '../../utility/postgres-tags';

export const listProjects: RouteMiddleware = async context => {
  const { siteId } = optionalUserWithScope(context, []);
  const scope = context.state.jwt?.scope || [];

  const page = Number(context.query.page) || 1;
  const rootTaskId = context.query.root_task_id;
  const modelId = context.query.capture_model_id;
  const onlyPublished = scope.indexOf('site.admin') !== -1 ? castBool(context.request.query.published) : true;
  const projectsPerPage = 10;

  const rootTaskQuery = rootTaskId ? sql`and iiif_project.task_id = ${rootTaskId}` : SQL_EMPTY;
  const modelQuery = modelId ? sql`and iiif_project.capture_model_id = ${modelId}` : SQL_EMPTY;
  const publishedQuery = onlyPublished ? sql`and (iiif_project.status = 1 or iiif_project.status = 2)` : SQL_EMPTY;

  const { total } = await context.connection.one(
    sql<{ total: number }>`
      select count(*) as total 
      from iiif_project
      where site_id = ${siteId}
      ${modelQuery}
      ${rootTaskQuery}
      ${publishedQuery}
    `
  );
  const totalPages = Math.ceil(total / projectsPerPage);

  const projects = await context.connection.any(
    getMetadata<{ resource_id: number; project_id: number }>(
      sql`
        select *, collection_id as resource_id, iiif_project.id as project_id from iiif_project 
            left join iiif_resource ir on iiif_project.collection_id = ir.id
        where site_id = ${siteId}
        ${modelQuery}
        ${rootTaskQuery}
        ${publishedQuery}
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
      status: project.status,
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
