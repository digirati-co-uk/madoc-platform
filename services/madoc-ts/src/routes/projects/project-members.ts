import invariant from 'tiny-invariant';
import { ProjectMember, ProjectMemberRole } from '../../types/projects';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const listProjectMembers: RouteMiddleware = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.admin']);

  const project = await context.projects.resolveProject(context.params.id, siteId);
  if (!project) {
    throw new NotFound();
  }

  context.response.body = {
    members: await context.projects.listProjectMembers(project.id, siteId),
  };
};

export const addProjectMember: RouteMiddleware<
  { id: string | number },
  { user_id: number; role?: ProjectMember['role'] }
> = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.admin']);

  const project = await context.projects.resolveProject(context.params.id, siteId);
  if (!project) {
    throw new NotFound();
  }

  const body = context.requestBody;

  invariant(body.user_id, 'User ID must be provided');

  await context.projects.addUserToProject(body.user_id, project.id, body.role);

  context.response.body = { success: true };
};

export const updateUsersProjectRole: RouteMiddleware<
  { id: string | number; userId: string | number },
  { role: ProjectMemberRole }
> = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.admin']);

  const project = await context.projects.resolveProject(context.params.id, siteId);
  if (!project) {
    throw new NotFound();
  }

  const body = context.requestBody;

  invariant(body.role, 'Role must be provided');
  invariant(body.role.id, 'Role must be provided');

  await context.projects.updateUsersProjectRole(Number(context.params.userId), project.id, body.role);

  context.response.body = { success: true };
};

export const removeProjectMember: RouteMiddleware<{ id: string | number; userId: string | number }> = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.admin']);

  const project = await context.projects.resolveProject(context.params.id, siteId);
  if (!project) {
    throw new NotFound();
  }

  await context.projects.removeUserFromProject(Number(context.params.userId), project.id);

  context.response.body = { success: true };
};
