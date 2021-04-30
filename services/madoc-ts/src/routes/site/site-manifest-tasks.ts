import { CrowdsourcingManifestTask } from '../../gateway/tasks/crowdsourcing-manifest-task';
import { RouteMiddleware } from '../../types/route-middleware';
import { canUserClaimManifest, findUserManifestTask } from '../../utility/claim-utilities';

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

  const manifestContributors: string[] = [];
  const contributors: string[] = [];
  for (const task of tasks) {
    if (
      task.type === 'crowdsourcing-task' &&
      task.status !== -1 &&
      task.assignee &&
      contributors.indexOf(task.assignee.id) === -1
    ) {
      contributors.push(task.assignee.id);
      manifestContributors.push(task.assignee.id);
    }
  }

  const canvasTasks = await siteApi.getTasks(0, {
    all: true,
    root_task_id: project?.task_id,
    subject_parent: `urn:madoc:manifest:${manifestId}`,
    detail: true,
  });

  const userManifestStats = {
    done: 0,
    progress: 0,
  };

  if (!config.claimGranularity || config.claimGranularity === 'canvas') {
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
  } else {
    const uniqueSub = [];
    for (const task of canvasTasks.tasks) {
      if (
        task.assignee &&
        task.assignee.id === `urn:madoc:user:${user}` &&
        task.status !== -1 &&
        task.type === 'crowdsourcing-task'
      ) {
        if (uniqueSub.indexOf(task.subject) === -1) {
          if (task.status === 2 || task.status === 3) {
            userManifestStats.done++;
          } else {
            userManifestStats.progress++;
          }

          uniqueSub.push(task.subject);
        }
      }
    }
  }

  const manifestTaskSimple = tasks.find(task => task.type === 'crowdsourcing-manifest-task');
  const manifestTask =
    manifestTaskSimple && manifestTaskSimple.id
      ? await siteApi.getTask(manifestTaskSimple.id, { assignee: true })
      : undefined;
  const maxContributors = manifestTask?.state.maxContributors || config.maxContributionsPerResource;
  const userTasks = user
    ? tasks.filter(task => task.status !== -1 && task.assignee && task.assignee.id === `urn:madoc:user:${user}`)
    : [];

  const canClaimManifest = user
    ? manifestTask
      ? canUserClaimManifest({ task: manifestTask as CrowdsourcingManifestTask, config })
      : true
    : false;

  const userManifestTask =
    manifestTask && user ? findUserManifestTask(manifestTask?.subject, user, manifestTask) : undefined;

  const isManifestComplete = manifestTask?.status === 3 || userManifestTask?.status === 3;

  const canUserSubmit =
    (!maxContributors || userTasks.length || maxContributors > contributors.length) && manifestTask?.status !== 3;

  context.response.status = 200;
  context.response.body = {
    canClaimManifest,
    userManifestTask,
    isManifestComplete,
    manifestTask,
    userTasks,
    totalContributors: contributors.length,
    maxContributors: config.maxContributionsPerResource,
    canUserSubmit: canUserSubmit,
    userManifestStats,
  };

  return;
};
