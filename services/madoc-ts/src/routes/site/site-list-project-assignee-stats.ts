import { RouteMiddleware } from '../../types/route-middleware';
import { extractIdFromUrn } from '../../utility/parse-urn';
import { RequestError } from '../../utility/errors/request-error';

export const siteListProjectAssigneeStats: RouteMiddleware = async context => {
  const { siteApi } = context.state;
  const projectSlug = context.params.projectSlug;
  const scope = context.state.jwt?.scope || [];

  const projectTask = await siteApi.getProjectTask(projectSlug);

  if (!projectTask || !projectTask.task_id) {
    throw new RequestError('No project task');
  }
  const assigneeSubmissions = await siteApi.getTaskAssigneeStats(projectTask.task_id, {
    status: 3,
    type: 'crowdsourcing-task',
    root: true,
  });

  const projectMembers = await siteApi.listProjectMembers(projectTask.id);

  if (!projectMembers) {
    context.response.body = {
      reviews: {},
      submissions: {},
    };
  }

  const submissionsStats = [];
  for (const [key, value] of Object.entries(assigneeSubmissions.assignee_id)) {
    const assigneeId = extractIdFromUrn(key);
    const findUser = projectMembers.members.find(m => m.id === assigneeId);

    submissionsStats.push({
      user: findUser?.user,
      submissions: value,
    });
  }

  context.response.body = {
    reviews: {},
    submissions: {
      stats: submissionsStats,
      total: assigneeSubmissions.total,
    },
  };
};
