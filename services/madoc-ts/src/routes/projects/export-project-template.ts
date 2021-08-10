import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';
import { parseProjectId } from '../../utility/parse-project-id';
import { NotFound } from '../../utility/errors/not-found';
import { api } from '../../gateway/api.server';

export const exportProjectTemplate: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, []);
  const { projectSlug, projectId } = parseProjectId(context.params.id);

  if (!projectId && !projectSlug) {
    throw new NotFound();
  }

  const userApi = api.asUser({ siteId });
  const project = await userApi.getProject(context.params.id);

  context.response.body = {
    templateName: `template-${projectId}`,
    config: project.config,
    capture_model_id: project.capture_model_id,
  };
};
