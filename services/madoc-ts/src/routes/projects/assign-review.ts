import { RouteMiddleware } from '../../types/route-middleware';
import { api } from '../../gateway/api.server';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { RequestError } from '../../utility/errors/request-error';

export const assignReview: RouteMiddleware<{ id: string }, { task_id: string }> = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.admin']);
  const { id } = context.params;
  const { task_id } = context.request.body;
  const userApi = api.asUser({ siteId });

  if (!task_id) {
    throw new RequestError('Invalid task.');
  }
  const project = await userApi.getProject(id);
  const task = await userApi.getTaskById(task_id);

  if (task.root_task !== project.task_id) {
    throw new RequestError('Task is not part of project');
  }

  if (task.type !== 'crowdsourcing-review') {
    throw new RequestError('Can only assign review tasks');
  }

  if (task.parent_task && task.parent_task !== project.task_id) {
    // Check if the parent task is assigned to someone, and use that instead.
    const parentTask = await userApi.getTaskById(task.parent_task);
    if (parentTask.assignee && !parentTask.assignee.is_service) {
      await userApi.assignUserToTask(task.id, {
        id: parentTask.assignee.id,
        name: parentTask.assignee.name,
      });

      context.response.body = {
        user: parentTask.assignee,
        reason: 'Parent task is assigned to this user.',
      };

      return;
    }
  }

  if (project.config.randomlyAssignReviewer) {
    const includeAdmins = project.config.adminsAreReviewers;

    // 1. Find all reviewers
    const users = await context.omeka.getUsersByRoles(siteId, ['reviewer'], !!includeAdmins);

    if (users.length) {
      // 2. Choose one at random.
      const randomNumber = Math.floor(Math.random() * users.length) % users.length;
      const user = users[randomNumber];
      if (user) {
        await userApi.assignUserToTask(task.id, {
          id: `urn:madoc:user:${user.id}`,
          name: user.name,
        });

        context.response.body = {
          user: user,
          reason: 'Randomly assigned to this user via site configuration.',
        };

        return;
      }
    }
    return;
  }

  if (project.config.manuallyAssignedReviewer) {
    // Then assign to this one reviewer.
    const userId = project.config.manuallyAssignedReviewer;
    if (userId) {
      // 1. Get users name
      const user = await context.omeka.getUserById(userId, siteId);

      if (user) {
        await userApi.assignUserToTask(task.id, {
          id: `urn:madoc:user:${user.id}`,
          name: user.name,
        });

        context.response.body = {
          user: user,
          reason: 'Manually assigned to this user via site configuration.',
        };

        return;
      }
    }
  }

  // Fallback to site owner if they are an admin.
  const admins = await context.omeka.getUsersByRoles(siteId, ['admin']);
  const ids = admins.map(u => u.id);
  const creator = await context.omeka.getSiteCreator(siteId);

  if (creator && ids.indexOf(creator.id) !== -1) {
    await userApi.assignUserToTask(task.id, {
      id: `urn:madoc:user:${creator.id}`,
      name: creator.name,
    });

    context.response.body = {
      user: creator,
      reason: 'Unable to find a reviewer, falling back to a site admin (creator).',
    };

    return;
  }

  const fallback = admins[0];
  if (fallback) {
    await userApi.assignUserToTask(task.id, {
      id: `urn:madoc:user:${fallback.id}`,
      name: fallback.name,
    });

    context.response.body = {
      user: fallback,
      reason: 'Unable to find a reviewer, falling back to a site admin.',
    };

    return;
  }

  throw new Error('Unable to find user');
};
