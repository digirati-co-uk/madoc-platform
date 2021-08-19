import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';
import { parseProjectId } from '../../utility/parse-project-id';
import { NotFound } from '../../utility/errors/not-found';
import { api } from '../../gateway/api.server';
import { JsonProjectTemplate } from '../../extensions/projects/types';
import { CaptureModel } from '@capture-models/types';
import deepmerge from 'deepmerge';
import { generateId, traverseDocument } from '@capture-models/helpers';

export const exportProjectTemplate: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, []);
  const { projectSlug, projectId } = parseProjectId(context.params.id);

  if (!projectId && !projectSlug) {
    throw new NotFound();
  }

  const userApi = api.asUser({ siteId });
  const project = await userApi.getProject(context.params.id);
  const captureModel: CaptureModel = await userApi.getCaptureModel(project.capture_model_id);

  const newDocument = deepmerge({}, captureModel.document, { clone: true });
  const updateId = (e: any) => {
    if (e.id) {
      e.id = generateId();
    }
  };
  traverseDocument(newDocument, {
    visitEntity: updateId,
    visitField: updateId,
    visitSelector: updateId,
  });

  context.response.body = {
    type: `template-${project.id}-${project.slug}`,
    metadata: {
      label: `Project ${project.id} export`,
      description: `An export of project ${project.slug}`,
      version: '1.0.0'
    },
    configuration: {
      defaults: project.config,
    },
    captureModel: newDocument,
  } as JsonProjectTemplate;
};
