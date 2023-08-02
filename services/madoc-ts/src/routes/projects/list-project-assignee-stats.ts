import { RouteMiddleware } from '../../types/route-middleware';
import { api } from '../../gateway/api.server';
import { userWithScope } from '../../utility/user-with-scope';
import { extractIdFromUrn } from '../../utility/parse-urn';

export const listProjectAssigneeStats: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const useApi = api.asUser({ siteId }, {}, true);
  const project = await useApi.getProject(context.params.id);
  const projectTaskId = project.task_id;

  const assigneeSubmissions = await useApi.getTaskAssigneeStats(projectTaskId || '', {
    status: 3,
    type: 'crowdsourcing-task',
    root: true,
  });

  const projectMembers = await useApi.listProjectMembers(project.id);

  const submissionsStats = [];
  for (const [key, value] of Object.entries(assigneeSubmissions.assignee_id)) {
    const findUser = projectMembers.members.find(m => m.id === extractIdFromUrn(key));

    submissionsStats.push({
      user: findUser?.user,
      submissions: value,
    });
  }

  context.response.body =
    {
      reviews: {},
      submissions: {
        stats: submissionsStats,
        total: assigneeSubmissions.total,
      },
    } || [];
};
