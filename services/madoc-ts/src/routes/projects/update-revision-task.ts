import { api } from '../../gateway/api.server';
import { userWithScope } from '../../utility/user-with-scope';
import { RouteMiddleware } from '../../types/route-middleware';
import { CrowdsourcingTask } from '../../gateway/tasks/crowdsourcing-task';
import { userCan } from '../../utility/user-can';
import { extractIdFromUrn } from '../../utility/parse-urn';

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

  if (task.type !== 'crowdsourcing-task') {
    throw new Error(`Task could not be updated, not a valid task`);
  }

  if (limitedReviewer) {
    if (task.delegated_task) {
      const reviewTask = await userApi.getTask(task?.delegated_task, { all: true });
      const assignedReviewer = reviewTask.assignee ? extractIdFromUrn(reviewTask.assignee.id) : '';
      if (assignedReviewer !== currentUser) {
        throw new Error('Not authorised');
      }
      await userApi.updateTask<CrowdsourcingTask>(id, taskBody);
      context.response.status = 200;
      return;
    }
    throw new Error('Task has no delegated reviewers');
  }

  if (!isAdmin || !canReview) {
    throw new Error('Not authorised');
  }

  await userApi.updateTask<CrowdsourcingTask>(id, taskBody);
  context.response.status = 200;
};
