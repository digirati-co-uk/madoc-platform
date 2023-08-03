import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';

export const siteProjectMembers: RouteMiddleware = async context => {
  const { siteApi } = context.state;
  const projectSlug = context.params.projectSlug;

  const projectTask = await siteApi.getProjectTask(projectSlug);

  if (!projectTask || !projectTask.task_id) {
    throw new NotFound();
  }

  context.response.body = await siteApi.listProjectMembers(projectTask.id);
};
