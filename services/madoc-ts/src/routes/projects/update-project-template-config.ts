import { RouteMiddleware } from '../../types/route-middleware';
import { sql } from 'slonik';
import { NotFound } from '../../utility/errors/not-found';
import { parseProjectId } from '../../utility/parse-project-id';
import { SQL_EMPTY } from '../../utility/postgres-tags';
import { userWithScope } from '../../utility/user-with-scope';
import { assertValidTabularProjectTemplateConfig } from './validate-tabular-project-template-config';

const TABULAR_PROJECT_TEMPLATE = 'tabular-project';
type UpdateProjectTemplateConfig = {
  template_config?: unknown;
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

  const project = await context.connection.maybeOne(
    sql<{ id: number; template_name: string | null }>`
      select id, template_name
      from iiif_project
      where
        ${projectId ? sql`id = ${projectId}` : SQL_EMPTY}
        ${projectSlug ? sql`slug = ${projectSlug}` : SQL_EMPTY}
        and site_id = ${siteId}
      limit 1
    `
  );

  if (!project) {
    throw new NotFound();
  }

  const hasTemplateConfig = typeof template_config !== 'undefined';
  const hasObjectTemplateConfig = hasTemplateConfig && template_config !== null && typeof template_config === 'object';
  const tabularConfigCandidate = hasObjectTemplateConfig
    ? (template_config as { tabular?: { structure?: unknown } })
    : null;
  const shouldValidateTabularTemplateConfig =
    project.template_name === TABULAR_PROJECT_TEMPLATE &&
    !!tabularConfigCandidate &&
    !!tabularConfigCandidate.tabular &&
    typeof tabularConfigCandidate.tabular === 'object' &&
    typeof tabularConfigCandidate.tabular.structure !== 'undefined';

  if (shouldValidateTabularTemplateConfig) {
    assertValidTabularProjectTemplateConfig(template_config, { requireModel: false });
  }

  const result = await context.connection.query(sql`
    update iiif_project
    set template_config = ${!hasTemplateConfig || template_config === null ? null : sql.json(template_config)}
    where
      id = ${project.id}
      and site_id = ${siteId}
  `);

  if (!result.rowCount) {
    throw new NotFound();
  }

  context.response.status = 204;
};
