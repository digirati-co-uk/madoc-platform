import { sql } from 'slonik';
import { SQL_EMPTY } from '../../utility/postgres-tags';

export function countResources(resource_type: string, site_id: number, parent_id?: number, showFlat = false) {
  if (parent_id) {
    return sql<{ total: number }>`
    select count(*) as total
      from iiif_derived_resource cidr
        left join iiif_derived_resource_items cidri 
            on cidr.resource_id = cidri.item_id
      where cidr.resource_type = ${resource_type} 
      and cidr.site_id = ${site_id}
      ${showFlat ? SQL_EMPTY : sql`and cidr.flat = false`}
      and cidri.resource_id = ${parent_id}
  `;
  }

  return sql<{ total: number }>`
    select count(*) as total
      from iiif_derived_resource
      where resource_type = ${resource_type} 
      and site_id = ${site_id}
      ${showFlat ? SQL_EMPTY : sql`and flat = false`}
  `;
}

export function deleteResource(resource_id: number, resource_type: string, site_id: number) {
  return sql`
    delete from iiif_derived_resource 
        where resource_id = ${resource_id} 
          and resource_type = ${resource_type}
          and site_id=${site_id}
  `;
}
