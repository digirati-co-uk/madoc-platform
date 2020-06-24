import { RouteMiddleware } from '../../types/route-middleware';
import { api } from '../../gateway/api.server';
import { userWithScope } from '../../utility/user-with-scope';
import { NotFound } from '../../utility/errors/not-found';

const statusToClaimMap = {
  [-1]: ' Rejected',
  [0]: 'Not started',
  [1]: 'In progress',
  [2]: 'Submitted',
  [3]: 'Accepted',
} as { [key: number]: string };

export const updateResourceClaim: RouteMiddleware<
  { claimId: string },
  { status: number; revisionId?: string }
> = async context => {
  const { siteId, userUrn } = userWithScope(context, ['models.contribute']);
  const userApi = api.asUser({ siteId });
  const taskId = context.params.claimId;
  const { status, revisionId } = context.requestBody;

  // 1. Make sure user is assigned to task.
  const task = await userApi.getTaskById(taskId);

  if (task.type !== 'crowdsourcing-task') {
    throw new NotFound();
  }

  if (!task.assignee || task.assignee.id !== userUrn) {
    throw new Error('You can only update your own resource claim, you are not assigned to this task');
  }

  if (typeof statusToClaimMap[status] === 'undefined') {
    throw new Error('Invalid status');
  }

  // 2. Update task status and revision.
  context.response.body = {
    claim: await userApi.updateTask(task.id, {
      status,
      status_text: statusToClaimMap[status],
      state: {
        revisionId,
      },
    }),
  };
  context.response.status = 200;
};
