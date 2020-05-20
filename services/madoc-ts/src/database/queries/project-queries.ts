import { sql } from 'slonik';

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
