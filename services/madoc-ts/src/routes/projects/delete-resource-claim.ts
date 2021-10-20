import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';
import {
  ensureProjectTaskStructure,
  getCanonicalClaim,
  getTaskFromClaim,
  ResourceClaim,
  verifyResourceInProject,
} from './create-resource-claim';

export const deleteResourceClaim: RouteMiddleware<{ id: string }, ResourceClaim> = async context => {
  // ID = project_id
  const { id: userId, siteId, siteUrn } = userWithScope(context, ['models.contribute']);
  const isAdmin = context.state.jwt?.scope.indexOf('site.admin') !== -1;
  const isTaskAdmin = isAdmin || context.state.jwt?.scope.indexOf('tasks.admin') !== -1;
  const canCreate = isTaskAdmin || context.state.jwt?.scope.indexOf('tasks.create') !== -1;

  if (context.requestBody.userId && !canCreate && context.requestBody.userId !== userId) {
    throw new Error('Cannot abandon on behalf of another user');
  }

  const userApi = api.asUser({ userId: userId, siteId });
  const siteApi = api.asUser({ siteId });
  const project = await userApi.getProject(context.params.id);
  const projectId = project.id;
  const claim = await getCanonicalClaim(context.requestBody, siteId, projectId, userId);

  await verifyResourceInProject(context, siteId, projectId, claim);

  const config = await userApi.getProjectConfiguration(projectId, siteUrn);

  // Make sure our fancy structure exists.
  const [parent] = await ensureProjectTaskStructure(context, siteId, projectId, userId, claim, config);

  // Check for existing claim
  const [existingClaim, manifestClaim] = await getTaskFromClaim({ userId: userId, parent, claim });

  if (claim.canvasId) {
    if (existingClaim) {
      await userApi.updateTask(existingClaim.id, {
        status: -1,
        status_text: 'abandoned',
      });
    }
    context.response.status = 200;
    return;
  }

  if (claim.manifestId) {
    if (manifestClaim && manifestClaim.id) {
      // 1. Delete manifest task
      await siteApi.deleteTask(manifestClaim.id);

      // 2. Mark all canvases as error on that manifest, by this user.
      const canvasTasks = await userApi.getTasks(0, {
        root_task_id: project.task_id,
        subject_parent: manifestClaim.subject,
        type: 'crowdsourcing-task',
        assignee: `urn:madoc:user:${userId}`,
        all: true,
      });

      for (const task of canvasTasks.tasks) {
        if (task.status !== 3 && task.status !== -1) {
          await siteApi.updateTask(task.id, {
            status: -1,
            status_text: 'abandoned',
          });
        }
      }
    }

    context.response.status = 200;
    return;
  }

  // Don't post an error here, it's possible they don't have a claim anymore.
  context.response.body = {
    existingClaim,
    claim,
  };

  context.response.status = 200;
};
