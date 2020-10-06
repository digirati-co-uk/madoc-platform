import { sql } from 'slonik';
import { SQL_EMPTY } from '../../utility/postgres-tags';

export function createProjectQuery(
  taskId: string,
  collectionId: number,
  siteId: number,
  captureModelId: number,
  slug?: string
) {
  return sql<{
    id: number;
    task_id: number;
    collection_id: number;
    slug: number;
    site_id: number;
    capture_model_id: number;
  }>`
      insert into iiif_project (task_id, collection_id, slug, site_id, capture_model_id)
      VALUES (
              ${taskId},
              ${collectionId},
              ${slug || null},
              ${siteId},
              ${captureModelId}
      ) returning *
  `;
}

export function getProject(project_id: number, site_id: number) {
  return sql<{
    id: number;
    task_id: string;
    collection_id: number;
    capture_model_id: string;
    slug?: string;
    site_id: number;
  }>`
      select id,
             task_id,
             collection_id,
             capture_model_id,
             slug,
             site_id
      from iiif_project
      where site_id = ${site_id}
        and id = ${project_id}
  `;
}

export function getProjectCollectionId(projectId: number, siteId: number, onlyPublished = false) {
  return sql<{
    collection_id: number;
  }>`
    select collection_id 
    from iiif_project 
    where site_id = ${siteId} 
      and id = ${projectId}
      ${onlyPublished ? sql`and (iiif_project.status = 1 or iiif_project.status = 2)` : SQL_EMPTY}
    `;
}
