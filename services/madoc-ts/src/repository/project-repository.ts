import { sql } from 'slonik';
import { getProject } from '../database/queries/project-queries';
import { Project } from '../types/project-full';
import {
  ProjectFeedbackRow,
  ProjectUpdatesRow,
  ProjectMemberRow,
  CreateProjectUpdate,
  ProjectMember,
  ProjectFeedback,
  ProjectUpdateSnapshot,
  ProjectUpdate,
  ProjectRow,
  ProjectMemberRole,
} from '../types/projects';
import { getMetadata } from '../utility/iiif-database-helpers';
import { mapMetadata } from '../utility/iiif-metadata';
import { parseProjectId } from '../utility/parse-project-id';
import { SQL_EMPTY } from '../utility/postgres-tags';
import { BaseRepository } from './base-repository';

export class ProjectRepository extends BaseRepository {
  // Start to migrate sql into this repository.
  static queries = {
    userProjectMember: (userId: number, projectId: number) => sql<ProjectMemberRow>`
      select * from project_members where user_id = ${userId} and project_id = ${projectId}
    `,

    // Project Updates
    listProjectUpdates: (projectId: number, siteId: number, count: number, offset?: number) => sql<ProjectUpdatesRow>`
      select pu.*, u.name as user_name from project_updates pu
        left join iiif_project ip on ip.id = pu.project_id
        left outer join "user" u on u.id = pu.user_id
        where project_id = ${projectId} and ip.site_id = ${siteId}
        order by pu.created desc
        limit ${count} offset ${offset || 0}
    `,

    countProjectUpdates: (projectId: number, siteId: number) => sql<{ total_items: number }>`
      select count(*) as total_items from project_updates pu
        left join iiif_project ip on ip.id = pu.project_id
        where project_id = ${projectId} and ip.site_id = ${siteId}
    `,

    // Project feedback
    listProjectFeedback: (projectId: number, siteId: number) => sql<ProjectFeedbackRow>`
      select pf.*, u.name as user_name from project_feedback pf
       left join iiif_project ip on ip.id = pf.project_id
       left outer join "user" u on u.id = pf.user_id
      where project_id = ${projectId} and ip.site_id = ${siteId}
    `,

    // Project members
    listProjectMembers: (projectId: number, siteId: number) => sql<ProjectMemberRow>`
      select pm.*, u.name as user_name, ip.slug as project_slug from project_members pm 
         left join iiif_project ip on ip.id = pm.project_id
         left outer join "user" u on u.id = pm.user_id
         where project_id = ${projectId} and ip.site_id = ${siteId}
    `,
  };

  static mutations = {
    createProjectUpdate: (update: CreateProjectUpdate, userId: number, projectId: number) => sql<ProjectUpdatesRow>`
      insert into project_updates (project_id, user_id, update, snapshot, created)
      values (${projectId}, ${userId}, ${update.update}, ${sql.json(
      (update.snapshot as Record<string, any>) || {}
    )}, now())
      returning *
    `,

    deleteProjectUpdate: (updateId: number, projectId: number) => sql`
      delete from project_updates where project_id = ${projectId} and id = ${updateId}
    `,
    updateProjectUpdate: (update: string, updateId: number, projectId: number) => sql<ProjectUpdatesRow>`
      update project_updates set update = ${update} where project_id = ${projectId} and id = ${updateId} returning *
    `,

    createProjectFeedback: (feedback: string, userId: number, projectId: number) => sql<ProjectFeedbackRow>`
      insert into project_feedback (project_id, user_id, feedback, created)
      values (${projectId}, ${userId}, ${feedback}, now())
      returning *
    `,
    deleteProjectFeedback: (feedbackId: number, projectId: number) => sql`
      delete from project_feedback where id = ${feedbackId} and project_id = ${projectId}
    `,

    addUserToProject: (userId: number, projectId: number, role?: ProjectMemberRole) =>
      role
        ? sql`
            insert into project_members (project_id, user_id, role, role_label, role_color) 
            values (${projectId}, ${userId}, ${role.id}, ${role.label || null}, ${role.color || null})`
        : sql`
            insert into project_members (project_id, user_id) values (${projectId}, ${userId})`,

    updateUsersProjectRole: (userId: number, projectId: number, role: ProjectMemberRole) =>
      sql`
        update project_members set 
          role = ${role.id}, role_label = ${role.label || null}, role_color = ${role.color || null}
        where project_id = ${projectId} and user_id = ${userId}`,

    removeUserFromProject: (userId: number, projectId: number) => sql`
      delete from project_members where project_id = ${projectId} and user_id = ${userId}
    `,
  };

  async resolveProject(idOrSlug: string | number, siteId: number) {
    const parsedId = idOrSlug ? parseProjectId(idOrSlug) : null;
    return parsedId ? await this.connection.one(getProject(parsedId, siteId)) : null;
  }

  static mapProjectUpdate(row: ProjectUpdatesRow): ProjectUpdate {
    return {
      id: row.id,
      user: {
        id: row.user_id,
        name: row.user_name || undefined,
      },
      update: row.update,
      snapshot: row.snapshot,
      created: row.created,
    };
  }

  static mapProjectFeedback(row: ProjectFeedbackRow): ProjectFeedback {
    return {
      id: row.id,
      user: {
        id: row.user_id,
        name: row.user_name || undefined,
      },
      feedback: row.feedback,
      created: row.created,
    };
  }

  static mapProjectMember(row: ProjectMemberRow): ProjectMember {
    return {
      id: row.id,
      user: {
        id: row.user_id,
        name: row.user_name || undefined,
      },
      created: row.created,
      project: row.project_slug
        ? {
            id: row.project_id,
            slug: row.project_slug,
          }
        : undefined,
      role: row.role
        ? {
            id: row.role,
            label: row.role_label || row.role,
            color: row.role_color || undefined,
          }
        : undefined,
    };
  }

  async getProjectByTaskId(taskId: number, siteId: number, onlyPublished = false): Promise<Project | undefined> {
    const projects = await this.connection.many(
      getMetadata<{ resource_id: number; project_id: number }>(
        sql`
        select *, collection_id as resource_id, iiif_project.id as project_id from iiif_project 
            left join iiif_resource ir on iiif_project.collection_id = ir.id
        where site_id = ${siteId} 
          and iiif_project.task_id = ${taskId}
          ${onlyPublished ? sql`and (iiif_project.status = 1 or iiif_project.status = 2)` : SQL_EMPTY}
      `,
        siteId
      )
    );

    const mappedProjects = mapMetadata(projects, ProjectRepository.mapProject);

    return mappedProjects[0] as any;
  }

  async getProjectByIdOrSlug(idOrSlug: string | number, siteId: number, onlyPublished = false): Promise<Project> {
    const { projectSlug, projectId } = parseProjectId(idOrSlug);

    const projects = await this.connection.many(
      getMetadata<{ resource_id: number; project_id: number }>(
        sql`
        select *, collection_id as resource_id, iiif_project.id as project_id from iiif_project 
            left join iiif_resource ir on iiif_project.collection_id = ir.id
        where site_id = ${siteId} 
          ${projectId ? sql`and iiif_project.id = ${projectId}` : SQL_EMPTY}
          ${projectSlug ? sql`and iiif_project.slug = ${projectSlug}` : SQL_EMPTY}
          ${onlyPublished ? sql`and (iiif_project.status = 1 or iiif_project.status = 2)` : SQL_EMPTY}
      `,
        siteId
      )
    );

    const mappedProjects = mapMetadata(projects, ProjectRepository.mapProject);

    return mappedProjects[0] as any;
  }

  static mapProject(project: any): Omit<Project, 'label' | 'summary'> {
    return {
      id: project.project_id,
      slug: project.slug,
      capture_model_id: project.capture_model_id,
      collection_id: project.id,
      task_id: project.task_id,
      status: project.status,
      style_id: project.style_id || null,
      template: project.template_name,
      template_config: project.template_config,
      dueDate: project.due_date ? new Date(project.due_date) : undefined,
      startDate: project.start_date ? new Date(project.start_date) : undefined,
      membersOnly: Boolean(project.members_only),
      placeholderImage: project.placeholder_image,
    };
  }

  async listProjectUpdates(projectId: number, siteId: number, count: number, offset?: number) {
    const updates = await this.connection.any(
      ProjectRepository.queries.listProjectUpdates(projectId, siteId, count, offset)
    );
    return updates.map(ProjectRepository.mapProjectUpdate);
  }

  async countProjectUpdates(projectId: number, siteId: number) {
    const count = await this.connection.oneFirst(ProjectRepository.queries.countProjectUpdates(projectId, siteId));
    return Number(count);
  }

  async listProjectFeedback(projectId: number, siteId: number) {
    const feedback = await this.connection.any(ProjectRepository.queries.listProjectFeedback(projectId, siteId));
    return feedback.map(ProjectRepository.mapProjectFeedback);
  }

  async listProjectMembers(projectId: number, siteId: number) {
    const members = await this.connection.any(ProjectRepository.queries.listProjectMembers(projectId, siteId));
    return members.map(ProjectRepository.mapProjectMember);
  }

  async createProjectUpdate(update: CreateProjectUpdate, userId: number, projectId: number) {
    const result = await this.connection.one(
      ProjectRepository.mutations.createProjectUpdate(update, userId, projectId)
    );
    return ProjectRepository.mapProjectUpdate(result);
  }

  async deleteProjectUpdate(updateId: number, projectId: number) {
    await this.connection.query(ProjectRepository.mutations.deleteProjectUpdate(updateId, projectId));
  }

  async isUserProjectMember(userId: number, projectId: number) {
    const result = await this.connection.query(ProjectRepository.queries.userProjectMember(userId, projectId));
    return result.rowCount > 0;
  }

  async updateProjectUpdate(update: string, updateId: number, projectId: number) {
    const result = await this.connection.one(
      ProjectRepository.mutations.updateProjectUpdate(update, updateId, projectId)
    );
    return ProjectRepository.mapProjectUpdate(result);
  }

  async createProjectFeedback(feedback: string, userId: number, projectId: number) {
    const result = await this.connection.one(
      ProjectRepository.mutations.createProjectFeedback(feedback, userId, projectId)
    );
    return ProjectRepository.mapProjectFeedback(result);
  }

  async deleteProjectFeedback(feedbackId: number, projectId: number) {
    await this.connection.query(ProjectRepository.mutations.deleteProjectFeedback(feedbackId, projectId));
  }

  async addUserToProject(userId: number, projectId: number, role?: ProjectMemberRole) {
    const isMember = await this.isUserProjectMember(userId, projectId);
    if (isMember) {
      return;
    }
    await this.connection.query(ProjectRepository.mutations.addUserToProject(userId, projectId, role));
  }

  async updateUsersProjectRole(userId: number, projectId: number, role: ProjectMemberRole) {
    await this.connection.query(ProjectRepository.mutations.updateUsersProjectRole(userId, projectId, role));
  }

  async removeUserFromProject(userId: number, projectId: number) {
    await this.connection.query(ProjectRepository.mutations.removeUserFromProject(userId, projectId));
  }
}
