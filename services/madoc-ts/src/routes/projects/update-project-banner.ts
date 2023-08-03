import { getProject } from '../../database/queries/project-queries';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { parseProjectId } from '../../utility/parse-project-id';
import { userWithScope } from '../../utility/user-with-scope';

export const updateProjectBanner: RouteMiddleware<{ id: string }, { banner: string | null }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const { projectSlug, projectId } = parseProjectId(context.params.id);
  const { banner } = context.requestBody;

  if (!projectSlug && !projectId) {
    throw new NotFound();
  }
  const project = await context.connection.one(getProject({ projectId, projectSlug }, siteId));

  await context.projects.setProjectBanner(project.id, banner, siteId);

  context.response.body = { banner };
};
