import { RouteMiddleware } from '../../types/route-middleware';

export const siteProjects: RouteMiddleware<{ slug: string }> = async context => {
  const { siteApi } = context.state;
  const page = context.query.page ? Number(context.query.page) : 1;

  const projects = await siteApi.getProjects(page);
  // @todo Filter projects by status.
  // If not running, then not found.
  // Get project collection id passing in page, and asking for only collections.
  // return collection id.
  context.response.status = 200;
  context.response.body = projects;
};
