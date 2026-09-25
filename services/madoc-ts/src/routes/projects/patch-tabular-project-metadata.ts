import { sql } from 'slonik';
import type { RouteMiddleware } from '../../types/route-middleware';
import type { TabularProjectMetadataUpdate } from '../../types/schemas/tabular-project-metadata';
import { NotFound } from '../../utility/errors/not-found';
import { RequestError } from '../../utility/errors/request-error';
import { parseProjectId } from '../../utility/parse-project-id';
import { userWithScope } from '../../utility/user-with-scope';

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function patchTabularProjectMetadata(
  config: unknown,
  update: TabularProjectMetadataUpdate
): Record<string, unknown> {
  if (!update || (!('crowdsourcingInstructions' in update) && !update.columns?.length)) {
    throw new RequestError('Provide contributor instructions or column metadata');
  }
  if (config != null && !isRecord(config)) {
    throw new RequestError('Project template configuration must be an object');
  }
  const next = { ...(config || {}) };
  if (typeof update.crowdsourcingInstructions === 'string') {
    next.crowdsourcingInstructions = update.crowdsourcingInstructions;
  }
  if (!update.columns?.length) {
    return next;
  }

  const tabular = next.tabular;
  const model = isRecord(tabular) ? tabular.model : undefined;
  if (!isRecord(tabular) || !isRecord(model) || !Array.isArray(model.columns)) {
    throw new RequestError('This project has no configured tabular columns');
  }
  const columns = model.columns;
  const changes = new Map<string, { label: string; helpText: string }>();
  for (const change of update.columns) {
    const column = columns.find(item => isRecord(item) && item.id === change.id);
    if (
      !isRecord(column) ||
      !change.id.trim() ||
      column.saved === false ||
      change.id.startsWith('__') ||
      column.type === 'hidden-field' ||
      column.fieldType === 'hidden-field' ||
      column.type === 'hidden' ||
      column.fieldType === 'hidden' ||
      changes.has(change.id)
    ) {
      throw new RequestError(`Invalid or duplicate column: ${change.id}`);
    }
    if (!change.label.trim() || change.label.length > 160) {
      throw new RequestError('Column labels must contain between 1 and 160 characters');
    }
    changes.set(change.id, { label: change.label.trim(), helpText: change.helpText });
  }

  // Keep the wizard's model definitions in sync without changing IDs, types or options.
  const fields = isRecord(model.captureModelFields) ? { ...model.captureModelFields } : undefined;
  const template = isRecord(model.captureModelTemplate) ? { ...model.captureModelTemplate } : undefined;
  for (const [id, change] of changes) {
    for (const [definition, key] of [
      [fields, id],
      [template, id],
      [template, `rows.${id}`],
    ] as const) {
      const field = definition?.[key];
      if (definition && Object.prototype.hasOwnProperty.call(definition, key) && isRecord(field)) {
        definition[key] = { ...field, label: change.label, description: change.helpText };
      }
    }
  }
  next.tabular = {
    ...tabular,
    model: {
      ...model,
      columns: columns.map(column =>
        isRecord(column) && typeof column.id === 'string' && changes.has(column.id)
          ? { ...column, ...changes.get(column.id) }
          : column
      ),
      ...(fields ? { captureModelFields: fields } : {}),
      ...(template ? { captureModelTemplate: template } : {}),
    },
  };
  return next;
}

export const patchTabularProjectMetadataRoute: RouteMiddleware<
  { id: string },
  TabularProjectMetadataUpdate
> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const { projectSlug, projectId } = parseProjectId(context.params.id);
  if (!projectSlug && !projectId) {
    throw new NotFound();
  }
  await context.connection.transaction(async connection => {
    const project = await connection.maybeOne(sql<{ id: number; template_config: unknown }>`
      select id, template_config from iiif_project
      where ${projectId ? sql`id = ${projectId}` : sql`slug = ${projectSlug!}`}
        and site_id = ${siteId} and template_name = 'tabular-project'
      for update
    `);
    if (!project) {
      throw new NotFound();
    }
    const config = patchTabularProjectMetadata(project.template_config, context.requestBody);
    await connection.query(sql`
      update iiif_project set template_config = ${JSON.stringify(config)}::json
      where id = ${project.id} and site_id = ${siteId}
    `);
  });
  context.response.status = 204;
};
