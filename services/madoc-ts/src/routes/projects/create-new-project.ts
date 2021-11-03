import deepmerge from 'deepmerge';
import { CrowdsourcingProjectTask } from '../../gateway/tasks/crowdsourcing-project-task';
import { ProjectRow } from '../../types/projects';
import { RouteMiddleware } from '../../types/route-middleware';
import { api } from '../../gateway/api.server';
import { RequestError } from '../../utility/errors/request-error';
import { userWithScope } from '../../utility/user-with-scope';
import { sql } from 'slonik';
import { CreateProject } from '../../types/schemas/create-project';
import { InternationalString } from '@hyperion-framework/types';
import { ConflictError } from '../../utility/errors/conflict';
import { iiifGetLabel } from '../../utility/iiif-get-label';

const firstLang = (field: InternationalString) => {
  const keys = Object.keys(field);
  return (field[keys[0]] || [])[0] || 'Untitled project';
};

export const createNewProject: RouteMiddleware<unknown, CreateProject> = async context => {
  const { siteId, siteUrn, id } = userWithScope(context, ['site.admin']);
  const userApi = api.asUser({ userId: id, siteId }, {}, true);
  context.disposableApis.push(userApi);

  const { label, slug, summary, template, template_options } = context.requestBody;
  const chosenTemplate = template ? api.projectTemplates.getDefinition(template, siteId) : null;
  const setupFunctions = chosenTemplate?.setup;

  if (template && !chosenTemplate) {
    throw new RequestError(`Invalid template ${template}.`);
  }

  context.response.body = {
    chosenTemplate,
  };

  if (!slug || !slug.trim()) {
    throw new ConflictError('Invalid slug, cannot be blank');
  }

  // 0 Check if slug exists.
  const { rowCount } = await context.connection.query(
    sql`select * from iiif_project where site_id = ${siteId} and slug = ${slug}`
  );

  if (rowCount) {
    throw new ConflictError('Slug is already used.');
  }

  // 1. Create collection [flat]
  const collection = await userApi.createCollection(
    {
      type: 'Collection',
      label: label,
      summary: summary,
    },
    undefined,
    true
  );

  // 2. Create or fork capture model
  const modelDocument = chosenTemplate?.captureModel?.document;
  const modelStructure = chosenTemplate?.captureModel?.structure;
  const beforeForkDocument = chosenTemplate?.setup?.beforeForkDocument;
  const beforeForkStructure = chosenTemplate?.setup?.beforeForkStructure;
  const modelTemplate =
    modelDocument && beforeForkDocument
      ? await beforeForkDocument(modelDocument, {
          api: userApi,
          options: template_options,
        })
      : null;

  const captureModel = modelDocument
    ? await userApi.createCaptureModelFromTemplate(modelTemplate || modelDocument, iiifGetLabel(label), {
        structure: modelStructure,
        processStructure: beforeForkStructure
          ? fullModel => {
              return beforeForkStructure(fullModel, { api: userApi, options: template_options });
            }
          : undefined,
      })
    : await userApi.createCaptureModel(iiifGetLabel(label));

  // 3. Create crowdsourcing task.
  const task = await userApi.newTask<CrowdsourcingProjectTask>({
    name: firstLang(label),
    subject: `urn:madoc:collection:${collection.id}`,
    parameters: [captureModel.id, chosenTemplate?.type],
    type: 'crowdsourcing-project',
    status_text: 'paused',
    status: 0,
    description: firstLang(summary),
  });

  // 4. Create project entry.
  try {
    const defaultStatus = chosenTemplate?.configuration?.status?.defaultStatus || 0;

    const project = await context.connection.one(sql<ProjectRow>`
        insert into iiif_project (task_id, collection_id, slug, site_id, capture_model_id, template_name, status)
        VALUES (
          ${task.id}, 
          ${collection.id}, 
          ${slug}, 
          ${siteId}, 
          ${captureModel.id}, 
          ${template || null}, 
          ${defaultStatus}
        )
        returning *
    `);

    const configurationOptions = chosenTemplate?.configuration;
    if (configurationOptions && configurationOptions.defaults) {
      // Apply default configuration.
      const siteConfig = await userApi.getProjectConfiguration(project.id, siteUrn);
      const onCreateConfiguration = setupFunctions?.onCreateConfiguration;
      const mergedConfiguration = deepmerge(siteConfig, configurationOptions.defaults);
      const hookConfiguration = onCreateConfiguration
        ? // @todo add config
          await onCreateConfiguration(mergedConfiguration, { api: userApi, options: template_options })
        : null;
      await userApi.saveSiteConfiguration(hookConfiguration ? hookConfiguration : mergedConfiguration, {
        project_id: project.id,
      });
    }

    if (setupFunctions?.onCreateProject) {
      // @todo add config
      await setupFunctions?.onCreateProject(project, { api: userApi, options: template_options });
    }

    if (chosenTemplate?.slots) {
      // This might not be the fastest, but it will ensure they are added correctly. Lot's of slots will
      // slow this down a bit.
      await userApi.pageBlocks.processSlotMappingRequest(chosenTemplate.slots, project.id);
    }

    // Returning project.
    context.response.body = await context.projects.getProjectByIdOrSlug(project.id, siteId);
  } catch (err) {
    console.log(err);
    // todo
    //   Mark task as errored – or delete it
    //   Delete collection
    //   Delete capture model derivative.
    return;
  }
};
