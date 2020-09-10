import { RouteMiddleware } from '../../types/route-middleware';

export const siteManifestTasks: RouteMiddleware<{
  slug: string;
  projectSlug: string;
  manifestId: string;
}> = async context => {
  const user = context.state.jwt ? context.state.jwt.user.id : undefined;
  const projectSlug = context.params.projectSlug;
  const manifestId = context.params.manifestId;
  const { siteApi } = context.state;

  const project = await siteApi.getProject(projectSlug);
  const { tasks } = await siteApi.getTasks(0, {
    root_task_id: project?.task_id,
    subject: `urn:madoc:manifest:${manifestId}`,
    detail: true,
  });

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

  const maxContributors = project.config.maxContributionsPerResource;
  const manifestTask = tasks.find(task => task.type === 'crowdsourcing-canvas-task');
  const userTasks = user ? tasks.filter(task => task.assignee && task.assignee.id === `urn:madoc:user:${user}`) : [];

  const canUserSubmit = !maxContributors || userTasks.length || maxContributors > contributors.length;

  context.response.status = 200;
  context.response.body = {
    manifestTask,
    userTasks,
    totalContributors: contributors.length,
    maxContributors: project.config.maxContributionsPerResource,
    canUserSubmit: !!canUserSubmit,
  };

  return;
};
