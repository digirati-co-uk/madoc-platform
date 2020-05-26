import { RouteMiddleware } from '../../types/route-middleware';

export const siteProject: RouteMiddleware<{ slug: string; projectSlug: string }> = async context => {
  const projectSlug = context.params.projectSlug;
  const { siteApi } = context.state;

  const project = await siteApi.getProject(projectSlug);
  // @todo Check if project is running (or is admin)
  // If not running, then not found.
  // Get project collection id passing in page, and asking for only collections.
  // return collection id.
  context.response.status = 200;
  context.response.body = project;

  return;
};
