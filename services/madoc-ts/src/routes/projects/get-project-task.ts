import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { parseProjectId } from '../../utility/parse-project-id';
import { sql } from 'slonik';
import { SQL_EMPTY } from '../../utility/postgres-tags';

export const getProjectTask: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = optionalUserWithScope(context, []);

  const { projectSlug, projectId } = parseProjectId(context.params.id);

  const scope = context.state.jwt?.scope || [];
  const onlyPublished = scope.indexOf('site.admin') === -1;

  const project = await context.connection.one(
    sql<{ id: number; task_id: number }>`
        select id, task_id from iiif_project 
        where site_id = ${siteId} 
          ${projectId ? sql`and iiif_project.id = ${projectId}` : SQL_EMPTY}
          ${projectSlug ? sql`and iiif_project.slug = ${projectSlug}` : SQL_EMPTY}
          ${onlyPublished ? sql`and (iiif_project.status = 1 or iiif_project.status = 2)` : SQL_EMPTY}
      `
  );

  context.response.body = {
    id: project.id,
    task_id: project.task_id,
  };
};
