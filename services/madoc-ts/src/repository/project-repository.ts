import { sql } from 'slonik';
import { Project } from '../types/schemas/project-full';
import { getMetadata } from '../utility/iiif-database-helpers';
import { mapMetadata } from '../utility/iiif-metadata';
import { parseProjectId } from '../utility/parse-project-id';
import { SQL_EMPTY } from '../utility/postgres-tags';
import { BaseRepository } from './base-repository';

export class ProjectRepository extends BaseRepository {
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

    const mappedProjects = mapMetadata(projects, project => {
      return {
        id: project.project_id,
        slug: project.slug,
        capture_model_id: project.capture_model_id,
        collection_id: project.id,
        task_id: project.task_id,
        status: project.status,
        template: project.template_name,
        template_config: project.template_config,
      };
    });

    return mappedProjects[0] as any;
  }
}
