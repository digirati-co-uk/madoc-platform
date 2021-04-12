import { RouteMiddleware } from '../../types/route-middleware';

export const siteManifestTasks: RouteMiddleware<{
  slug: string;
  projectSlug: string;
  manifestId: string;
}> = async context => {
  const user = context.state.jwt ? context.state.jwt.user.id : undefined;
  const projectSlug = context.params.projectSlug;
  const manifestId = context.params.manifestId;
  const { siteApi, site } = context.state;

  const project = await siteApi.getProjectTask(projectSlug);
  const [config, { tasks }] = await Promise.all([
    siteApi.getProjectConfiguration(project.id as any, `urn:madoc:site:${site.id}`),
    siteApi.getTasks(0, {
      root_task_id: project?.task_id,
      subject: `urn:madoc:manifest:${manifestId}`,
      detail: true,
      all: true,
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

  if (!config.claimGranularity || config.claimGranularity === 'canvas') {
    const canvasTasks = await siteApi.getTasks(0, {
      all: true,
      root_task_id: project?.task_id,
      subject_parent: `urn:madoc:manifest:${manifestId}`,
      detail: true,
    });

    for (const task of canvasTasks.tasks) {
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
  }

  const maxContributors = config.maxContributionsPerResource;
  const manifestTask = tasks.find(task => task.type === 'crowdsourcing-manifest-task');
  const userTasks = user ? tasks.filter(task => task.assignee && task.assignee.id === `urn:madoc:user:${user}`) : [];

  const canUserSubmit =
    (!maxContributors || userTasks.length || maxContributors > contributors.length) && manifestTask?.status !== 3;

  context.response.status = 200;
  context.response.body = {
    manifestTask,
    userTasks,
    totalContributors: contributors.length,
    maxContributors: config.maxContributionsPerResource,
    canUserSubmit: !!canUserSubmit,
  };

  return;
};
