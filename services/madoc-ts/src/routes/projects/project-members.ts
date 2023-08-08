import { sql } from 'slonik';
import invariant from 'tiny-invariant';
import { api } from '../../gateway/api.server';
import { ProjectMember, ProjectMemberRole } from '../../types/projects';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { parseUrn } from '../../utility/parse-urn';
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

export const migrateProjectMembers: RouteMiddleware<{ id: string | number }> = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.admin']);
  // 1st. Get all projects.
  const allProjects = await context.connection.any(sql<{ id: number; task_id: string }>`
    select id, task_id from iiif_project where site_id = ${siteId}
  `);

  console.log(`=> Migrate Project Members: found ${allProjects.length} projects`);

  const siteApi = api.asUser({ siteId });
  for (const project of allProjects) {
    if (project.task_id) {
      console.log(`=> Migrate Project Members: Root task: ${project.task_id}`);

      try {
        // Find users who have been assigned to a task that is complete.
        const assignees = await siteApi.getTaskAssigneeStats(project.task_id, {
          status: 3,
          type: 'crowdsourcing-task',
          root: true,
        });
        const users = Object.keys(assignees.assignee_id || {})
          .map(parseUrn)
          .filter(Boolean);

        console.log(`=> Migrate Project Members: Found ${users.length} users`);
        for (const user of users) {
          if (user) {
            console.log(`=> Migrate Project Members: Adding ${user.id} to ${project.id}`);
            await context.projects.addUserToProject(user.id, project.id);
          }
        }
      } catch (err) {
        // Ignore.
        console.log(err);
      }
    }
  }

  context.response.body = { success: true };
};
