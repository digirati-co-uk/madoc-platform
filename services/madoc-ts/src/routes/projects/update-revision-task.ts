import { api } from '../../gateway/api.server';
import { userWithScope } from '../../utility/user-with-scope';
import { RouteMiddleware } from '../../types/route-middleware';
import { CrowdsourcingTask } from '../../gateway/tasks/crowdsourcing-task';
import { userCan } from '../../utility/user-can';
import { extractIdFromUrn } from '../../utility/parse-urn';
import { getTabularApprovalBlockedMessage, getTabularFlaggedCellCount } from '../../utility/tabular-flags';
import { RequestError } from '../../utility/errors/request-error';

const APPROVED_TASK_STATUS = 3;

function toTaskStatus(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return Number(value);
  }

  return null;
}

export const updateRevisionTask: RouteMiddleware<{ taskId: string; task: any }> = async context => {
  const { siteId } = userWithScope(context, ['models.contribute', 'models.revision']);

  const canCreate = userCan('models.create', context.state);
  const canReview = userCan('models.revision', context.state);
  const isAdmin = userCan('models.admin', context.state);

  const currentUser = context.state?.jwt?.user.id;
  const limitedReviewer = canReview && !canCreate;

  const userApi = api.asUser({ siteId });
  const id = context.params.taskId;
  const taskBody = context.requestBody.task;

  const task = await userApi.getTask(id, { all: true });

  if (!id) {
    throw new Error('Task could not be updated');
  }

  if (!taskBody) {
    throw new Error('Task could not be updated, no body');
  }

  if (
    task.type !== 'crowdsourcing-task' &&
    task.type !== 'crowdsourcing-manifest-task' &&
    task.type !== 'crowdsourcing-canvas-task'
  ) {
    throw new Error(`Task could not be updated, not a valid task`);
  }

  const nextStatus = toTaskStatus(taskBody.status);
  const isApprovingTask =
    task.type === 'crowdsourcing-task' && nextStatus === APPROVED_TASK_STATUS && task.status !== APPROVED_TASK_STATUS;
  if (isApprovingTask) {
    const revisionId = taskBody.state?.revisionId || task.state?.revisionId;
    if (typeof revisionId === 'string' && revisionId.length > 0) {
      const revisionRequest = await userApi.crowdsourcing.getCaptureModelRevision(revisionId);
      const flaggedCellCount = getTabularFlaggedCellCount(revisionRequest);
      if (flaggedCellCount > 0) {
        throw new RequestError(getTabularApprovalBlockedMessage(flaggedCellCount));
      }
    }
  }

  if (limitedReviewer) {
    if (task.delegated_task) {
      const reviewTask = await userApi.getTask(task?.delegated_task, { all: true });
      const assignedReviewer = reviewTask.assignee ? extractIdFromUrn(reviewTask.assignee.id) : '';
      if (assignedReviewer !== currentUser) {
        throw new Error('Not authorised');
      }
      await userApi.updateTask<CrowdsourcingTask>(id, taskBody);
      context.response.status = 204;
      return;
    }
    throw new Error('Task has no delegated reviewers');
  }

  if (!isAdmin && !canReview) {
    throw new Error('Not authorised');
  }

  await userApi.updateTask<CrowdsourcingTask>(id, taskBody);
  context.response.status = 204;
};
