import { sql } from 'slonik';
import { MetadataField } from '../../utility/iiif-metadata';
import { SQL_EMPTY } from '../../utility/postgres-tags';

export function getItemStructures(resource_id: number, site_id: number, type?: string) {
  return sql<MetadataField>`
    select distinct im.resource_id as resource_id,
           im.key         as key,
           im.value       as value,
           im.language    as language,
           im.source      as source,
           manifests.item_index as index,
           iiif_resource.type as resource_type
    from iiif_derived_resource_items manifests
             left join iiif_resource on manifests.item_id = iiif_resource.id
             left join iiif_metadata im on (im.resource_id = manifests.item_id)
    where im.key = 'label'
      and im.site_id = ${site_id}
      and manifests.resource_id = ${resource_id}
      ${type ? sql`and iiif_resource.type = ${type}` : SQL_EMPTY}
    order by manifests.item_index
  `;
}
