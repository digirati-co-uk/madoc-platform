import { sql } from 'slonik';
import { SQL_EMPTY } from '../../utility/postgres-tags';

export function getProject({ projectId, projectSlug }: { projectId?: number; projectSlug?: string }, site_id: number) {
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
        ${projectId ? sql`and id = ${projectId}` : SQL_EMPTY}
        ${projectSlug ? sql`and slug = ${projectSlug}` : SQL_EMPTY}
  `;
}

export function getProjectCollectionId(
  { projectId, projectSlug }: { projectId?: number; projectSlug?: string },
  siteId: number,
  onlyPublished = false
) {
  return sql<{
    collection_id: number;
  }>`
    select collection_id 
    from iiif_project 
    where site_id = ${siteId} 
      ${projectId ? sql`and iiif_project.id = ${projectId}` : SQL_EMPTY}
      ${projectSlug ? sql`and iiif_project.slug = ${projectSlug}` : SQL_EMPTY}
      ${onlyPublished ? sql`and (iiif_project.status = 1 or iiif_project.status = 2)` : SQL_EMPTY}
    `;
}
