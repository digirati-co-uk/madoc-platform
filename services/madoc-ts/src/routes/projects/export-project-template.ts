import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';
import { parseProjectId } from '../../utility/parse-project-id';
import { NotFound } from '../../utility/errors/not-found';
import { api } from '../../gateway/api.server';
import { JsonProjectTemplate } from '../../extensions/projects/types';
import { CaptureModel } from '@capture-models/types';

export const exportProjectTemplate: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, []);
  const { projectSlug, projectId } = parseProjectId(context.params.id);

  if (!projectId && !projectSlug) {
    throw new NotFound();
  }

  const userApi = api.asUser({ siteId });
  const project = await userApi.getProject(context.params.id);
  const captureModel: CaptureModel = await userApi.getCaptureModel(project.capture_model_id);

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
    setupModel: captureModel.document,
    captureModel: captureModel.document
  } as JsonProjectTemplate;
};
