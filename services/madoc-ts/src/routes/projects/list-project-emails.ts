import { getProject } from '../../database/queries/project-queries';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { parseProjectId } from '../../utility/parse-project-id';
import { userWithScope } from '../../utility/user-with-scope';

export const listProjectEmails: RouteMiddleware = async context => {
  const { siteId, id: userId } = userWithScope(context, ['site.admin']);
  const parsedId = context.params.id ? parseProjectId(context.params.id) : null;
  const project = parsedId ? await context.connection.one(getProject(parsedId, siteId)) : null;
  const projectId = project ? project.id : null;

  if (!projectId) {
    throw new NotFound();
  }

  const members = await context.projects.listProjectMembers(projectId, siteId);
  const validMembersWithEmails = [];
  for (const member of members) {
    const user = await context.siteManager.requestUserDetails(member.user.id, userId, siteId);
    if (user.preferences.visibility?.email === 'public' || user.preferences.visibility?.email === 'staff') {
      const userData = await context.siteManager.getUserById(member.user.id);
      validMembersWithEmails.push({
        id: userData.id,
        name: userData.name,
        email: userData.email,
      });
    }
  }

  context.response.body = {
    users: validMembersWithEmails,
  };
};
