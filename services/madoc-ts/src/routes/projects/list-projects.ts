// Lists projects, joining with metadata table, sort of like an IIIF resource.
//  - Statistics from the task service.
import { RouteMiddleware } from '../../types/route-middleware';
import { sql } from 'slonik';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { api } from '../../gateway/api.server';
import { getMetadata } from '../../utility/iiif-database-helpers';
import { mapMetadata } from '../../utility/iiif-metadata';

export const listProjects: RouteMiddleware = async context => {
  const { id, siteId, siteUrn } = optionalUserWithScope(context, []);

  const projectsPerPage = 5;
  const projects = await context.connection.any(
    getMetadata<{ resource_id: number; project_id: number }>(
      sql`
        select *, collection_id as resource_id, iiif_project.id as project_id from iiif_project 
            left join iiif_resource ir on iiif_project.collection_id = ir.id
        where site_id = ${siteId} limit ${projectsPerPage}
      `,
      siteId
    )
  );

  const mappedProjects = mapMetadata(projects, project => {
    return {
      id: project.project_id,
      collection_id: project.id,
      slug: project.slug,
      capture_model_id: project.capture_model_id,
      task_id: project.task_id,
    };
  });

  for (const project of mappedProjects) {
    project.statistics = {
      '0': 0,
      '1': 0,
      '2': 0,
      '3': 0,
      ...((await api.getTaskStats(project.task_id as string)).statuses || ({} as any)),
    } as any;

    project.config = ((await api.getConfiguration('madoc', [
      `urn:madoc:project:${project.id}`,
      siteUrn,
    ])) as any).config[0].config_object;
    // project.model = (await api.asUser({ userId: id, siteId }).getCaptureModel(project.capture_model_id as any)) as any;
  }

  context.response.body = mappedProjects;
};
