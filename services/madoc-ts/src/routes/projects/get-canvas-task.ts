import invariant from 'tiny-invariant';
import { getProject } from '../../database/queries/project-queries';
import { api } from '../../gateway/api.server';
import { CrowdsourcingCanvasTask } from '../../gateway/tasks/crowdsourcing-canvas-task';
import { RouteMiddleware } from '../../types/route-middleware';
import { parseProjectId } from '../../utility/parse-project-id';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const getCanvasTask: RouteMiddleware = async context => {
  const { siteId, siteUrn, userUrn } = optionalUserWithScope(context, ['site.admin']);
  const parsedId = parseProjectId(context.params.id);
  const project = parsedId ? await context.connection.one(getProject(parsedId, siteId)) : undefined;
  const canvasId = Number(context.params.canvasId as string);
  const manifestId = context.query.manifest_id as string | undefined;
  const siteApi = api.asUser({ siteId });

  invariant(project, 'Project not found');

  // Gather all tasks and data.
  const [config, allTasks, projectTask, manifestTasks] = await Promise.all([
    siteApi.getProjectConfiguration(project.id, siteUrn),
    siteApi.getTasks(0, {
      all: true,
      root_task_id: project.task_id,
      subject: `urn:madoc:canvas:${canvasId}`,
      detail: true,
    }),
    siteApi.getTask(project.task_id),
    Promise.resolve(
      manifestId
        ? siteApi
            .getTasks(0, {
              all: true,
              root_task_id: project.task_id,
              subject: `urn:madoc:manifest:${manifestId}`,
              detail: true,
            })
            .then(t => t?.tasks) || []
        : []
    ),
  ]);

  const canvasTask = allTasks.tasks.find(task => task.type === 'crowdsourcing-canvas-task') as
    | CrowdsourcingCanvasTask
    | undefined;

  const manifestTask = manifestTasks.find(task => task.type === 'crowdsourcing-manifest-task');
  const userManifestTasks = manifestTasks.filter(
    task => task.type === 'crowdsourcing-task' && task.assignee && task.assignee.id === userUrn
  );

  // Start gathering the facts.
  const isProjectActive = projectTask?.status === 1;
  const isProjectPreparing = projectTask?.status === 4;
  const isProjectPaused = !isProjectActive && !isProjectPreparing;
  const isManifestComplete = manifestTask?.status === 3;
  const isCanvasComplete = canvasTask?.status === 3;

  const allUserTasks = allTasks.tasks.filter(task => task.assignee && task.assignee.id === userUrn);
  const currentUserTasks = allUserTasks.filter(task => task.type === 'crowdsourcing-task');
  const doesCurrentUserHaveReviewTask = allUserTasks.some(
    task => task.type === 'crowdsourcing-review' && task.status !== 3
  );

  const hasUserTaskBeenRejected = currentUserTasks.some(task => task.status === -1);
  const canUserStillSubmitAfterRejection = !config.modelPageOptions?.preventContributionAfterRejection;

  const uniqueContributors = new Set<string>();

  for (const task of allTasks.tasks) {
    if (task.type === 'crowdsourcing-task' && task.status !== -1 && task.assignee) {
      uniqueContributors.add(task.assignee.id);
    }
  }
  const totalUniqueContributors = uniqueContributors.size;
  const maxContributorsReached = config.maxContributionsPerResource
    ? totalUniqueContributors >= config.maxContributionsPerResource
    : false;

  const hasUserSubmittedTask = currentUserTasks.some(task => task.status === 2);
  const hasUserCompletedTask = currentUserTasks.some(task => task.status === 3);
  const hasUserCompletedAndCanStillContribute =
    (hasUserCompletedTask || hasUserSubmittedTask) && config.allowSubmissionsWhenCanvasComplete;

  const isUserAssignedManifest = userManifestTasks.filter(task => task.status !== -1).length > 0;
  const hasUserCompletedManifest = userManifestTasks.filter(task => (task.status || 0) >= 2).length > 0;
  const isManifestInReview = userManifestTasks.filter(task => (task.status || 0) === 2).length > 0;

  const isUserWorkingOnCanvas = currentUserTasks.length > 0;

  const inProgressUserTask = currentUserTasks.find(
    task => (task.type === 'crowdsourcing-task' && task.status === 1) || task.status === 0
  );
  const rejectedUserTask = currentUserTasks.find(task => task.type === 'crowdsourcing-task' && task.status === -1);

  const rejectedMessage = !inProgressUserTask && rejectedUserTask ? rejectedUserTask.state.rejectedMessage : undefined;
  const progressMessage = inProgressUserTask ? 'In progress' : undefined;

  const completeMessage = hasUserCompletedTask ? 'Complete' : hasUserSubmittedTask ? 'Submitted for review' : undefined;

  const canUserMakeNewContribution =
    (isUserWorkingOnCanvas &&
      (!hasUserCompletedTask || hasUserCompletedAndCanStillContribute) &&
      (!hasUserTaskBeenRejected || canUserStillSubmitAfterRejection)) ||
    !maxContributorsReached;

  context.response.body = {
    // This will change the most often.
    canWork: canUserMakeNewContribution,

    // @todo get the new field for contribution "type" from the project template.
    //   - Add data that would be required from the tasks (e.g. revision)
    // detail: {
    //   type: 'default',
    //   revisionId: '...',
    // },
    messages: {
      rejected: rejectedMessage,
      progress: progressMessage,
      complete: completeMessage,
    },
    manifestFacts: {
      isManifestComplete,
      isManifestInReview,
      isUserAssignedManifest,
      hasUserCompletedManifest,
    },
    canvasFacts: {
      isUserWorkingOnCanvas,
      canUserMakeNewContribution,
      hasUserSubmittedTask,
      hasUserCompletedTask,
      hasUserCompletedAndCanStillContribute,
      maxContributorsReached,
      totalUniqueContributors,
      hasUserTaskBeenRejected,
      canUserStillSubmitAfterRejection,
      doesCurrentUserHaveReviewTask,
      isManifestComplete,
      isCanvasComplete,
    },
    projectFacts: {
      isProjectPaused,
      isProjectPreparing,
      isProjectActive,
    },
    userManifestTasks,
    currentUserTasks,
    manifestId,
    manifestTask,
    canvasTask,
    config,
    project,
  };
};
