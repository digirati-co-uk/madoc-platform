import { RouteMiddleware } from '../../types/route-middleware';
import { sql } from 'slonik';
import { NotFound } from '../../utility/errors/not-found';
import { parseProjectId } from '../../utility/parse-project-id';
import { SQL_EMPTY } from '../../utility/postgres-tags';
import { userWithScope } from '../../utility/user-with-scope';

type UpdateProjectTemplateConfig = {
  template_config?: any | null;
};

export const updateProjectTemplateConfig: RouteMiddleware<
  { id: string },
  UpdateProjectTemplateConfig
> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const { projectSlug, projectId } = parseProjectId(context.params.id);
  const { template_config } = context.requestBody || {};

  if (!projectSlug && !projectId) {
    throw new NotFound();
  }

  const serialisedTemplateConfig =
    typeof template_config === 'undefined' || template_config === null ? null : sql.json(template_config);

  const result = await context.connection.query(sql`
    update iiif_project
    set template_config = ${serialisedTemplateConfig}
    where
      ${projectId ? sql`id = ${projectId}` : SQL_EMPTY}
      ${projectSlug ? sql`slug = ${projectSlug}` : SQL_EMPTY}
      and site_id = ${siteId}
  `);

  if (!result.rowCount) {
    throw new NotFound();
  }

  context.response.status = 204;
};
