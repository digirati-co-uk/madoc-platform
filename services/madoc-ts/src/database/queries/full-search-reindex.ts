import { DatabasePoolType, sql } from 'slonik';
import type { SearchIndexResource } from '../../gateway/tasks/search-index-task';

export type FullSearchReindexResourceType = 'manifest' | 'collection' | 'project';

export async function getFullSearchReindexResources(
  connection: DatabasePoolType,
  siteId: number,
  type: FullSearchReindexResourceType,
  afterId: number,
  limit: number
): Promise<SearchIndexResource[]> {
  if (type === 'project') {
    const resources = await connection.any(sql<SearchIndexResource>`
      select id, 'project'::text as type
      from iiif_project
      where site_id = ${siteId} and id > ${afterId}
      order by id
      limit ${limit}
    `);
    return [...resources];
  }

  const resources = await connection.any(sql<SearchIndexResource>`
    select resource_id as id, resource_type as type
    from iiif_derived_resource
    where site_id = ${siteId}
      and resource_type = ${type}
      and resource_id > ${afterId}
      and (${type} = 'manifest' or flat = false)
    order by resource_id
    limit ${limit}
  `);
  return [...resources];
}
