import { RouteMiddleware } from '../../types/route-middleware';

export const siteCanvasTasks: RouteMiddleware<{
  slug: string;
  projectSlug: string;
  canvasId: string;
}> = async context => {
  const user = context.state.jwt ? context.state.jwt.user.id : undefined;
  const projectSlug = context.params.projectSlug;
  const canvasId = context.params.canvasId;
  const { siteApi } = context.state;

  const project = await siteApi.getProject(projectSlug);
  const { tasks } = await siteApi.getTasks(0, {
    root_task_id: project?.task_id,
    subject: `urn:madoc:canvas:${canvasId}`,
    detail: true,
  });

  const canvasTask = tasks.find(task => task.type === 'crowdsourcing-canvas-task');
  const userTasks = user ? tasks.filter(task => task.assignee && task.assignee.id === `urn:madoc:user:${user}`) : [];

  context.response.status = 200;
  context.response.body = { canvasTask, userTasks };

  return;
};
