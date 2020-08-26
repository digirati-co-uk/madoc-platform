import { sql } from 'slonik';
import { SQL_EMPTY, SQL_INT_ARRAY } from '../../utility/postgres-tags';

export function getResourceCount(resourceId: number | number[], siteId: number) {
  if (Array.isArray(resourceId)) {
    return sql<{ resource_id: number; total: number }>`
      select resource_id, item_total as total
        from iiif_derived_resource_item_counts
        where resource_id = ANY (${sql.array(resourceId, SQL_INT_ARRAY)})
        and site_id = ${siteId}
    `;
  }

  return sql<{ resource_id: number; total: number }>`
    select resource_id, item_total as total
      from iiif_derived_resource_item_counts
      where resource_id = ${resourceId}
      and site_id = ${siteId}
  `;
}
