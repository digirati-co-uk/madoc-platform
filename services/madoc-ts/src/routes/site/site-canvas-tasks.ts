import { RouteMiddleware } from '../../types/route-middleware';

export const siteCanvasTasks: RouteMiddleware<{
  slug: string;
  projectSlug: string;
  canvasId: string;
}> = async context => {
  const user = context.state.jwt ? context.state.jwt.user.id : undefined;
  const projectSlug = context.params.projectSlug;
  const canvasId = context.params.canvasId;
  const { siteApi, site } = context.state;

  const project = await siteApi.getProjectTask(projectSlug);
  const [config, { tasks }] = await Promise.all([
    siteApi.getProjectConfiguration(project.id as any, `urn:madoc:site:${site.id}`),
    siteApi.getTasks(0, {
      root_task_id: project?.task_id,
      subject: `urn:madoc:canvas:${canvasId}`,
      detail: true,
    }),
  ]);

  const contributors: string[] = [];
  for (const task of tasks) {
    if (
      task.type === 'crowdsourcing-task' &&
      task.status !== -1 &&
      task.status !== 0 &&
      task.assignee &&
      contributors.indexOf(task.assignee.id) === -1
    ) {
      contributors.push(task.assignee.id);
    }
  }

  const maxContributors = config.maxContributionsPerResource;
  const canvasTask = tasks.find(task => task.type === 'crowdsourcing-canvas-task');
  const userTasks = user ? tasks.filter(task => task.assignee && task.assignee.id === `urn:madoc:user:${user}`) : [];

  const manifestTask = canvasTask && canvasTask.parent_task ? await siteApi.getTask(canvasTask.parent_task) : undefined;

  const canUserSubmit =
    (!maxContributors || userTasks.length || maxContributors > contributors.length) &&
    canvasTask?.status !== 3 &&
    manifestTask?.status !== 3;

  const isManifestComplete = manifestTask?.status === 3;

  context.response.status = 200;
  context.response.body = {
    canvasTask,
    manifestTask,
    userTasks,
    totalContributors: contributors.length,
    maxContributors: config.maxContributionsPerResource,
    isManifestComplete,
    canUserSubmit: !!canUserSubmit,
  };

  return;
};
