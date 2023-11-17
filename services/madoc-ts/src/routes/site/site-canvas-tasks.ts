import { CrowdsourcingManifestTask } from '../../gateway/tasks/crowdsourcing-manifest-task';
import { RouteMiddleware } from '../../types/route-middleware';
import { canUserClaimResource, findUserManifestTask } from '../../utility/claim-utilities';

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

  const manifestTask =
    canvasTask && canvasTask.parent_task
      ? await siteApi.getTask(canvasTask.parent_task, { detail: true, assignee: true })
      : undefined;

  const canClaimManifest = user
    ? manifestTask
      ? canUserClaimResource({ task: manifestTask as CrowdsourcingManifestTask, config, userId: user })
      : true
    : false;

  const userManifestTask =
    manifestTask && user ? findUserManifestTask(manifestTask?.subject, user, manifestTask) : undefined;

  const isManifestComplete = manifestTask?.status === 3 || userManifestTask?.status === 3;

  const canUserSubmit =
    (userManifestTask && userManifestTask.status !== 3) ||
    ((!maxContributors || userTasks.length || maxContributors > contributors.length) &&
      canvasTask?.status !== 3 &&
      manifestTask?.status !== 3);

  context.response.status = 200;
  context.response.body = {
    canvasTask,
    manifestTask,
    userManifestTask,
    userTasks,
    totalContributors: contributors.length,
    maxContributors: config.maxContributionsPerResource,
    canClaimManifest,
    isManifestComplete,
    canUserSubmit: !!canUserSubmit,
  };

  return;
};
