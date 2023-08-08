import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';

export const siteProjectRecent: RouteMiddleware = async context => {
  const { siteApi } = context.state;
  const page = context.query.page ? Number(context.query.page) : 1;
  const projectSlug = context.params.projectSlug;
  const scope = context.state.jwt?.scope || [];
  const isAdmin = scope.indexOf('site.admin') !== -1;

  const rootTask = await siteApi.getProjectTask(projectSlug);

  if (!rootTask) {
    throw new NotFound();
  }

  context.response.body = await siteApi.getTasks(page, {
    root_task_id: rootTask.task_id,
    type: 'crowdsourcing-task',
    status: [3],
    sort_by: 'newest',
  });
};
