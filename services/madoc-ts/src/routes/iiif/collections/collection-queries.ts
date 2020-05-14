import { sql } from 'slonik';

export function collectionAutocomplete({
  siteId,
  query,
  field = 'label',
  results = 10,
  language,
}: {
  siteId: number;
  query: string;
  language?: string;
  field?: string;
  results?: number;
}) {
  return sql<{ resource_id: number; value: string }>`
    select distinct im.resource_id, im.value
    from iiif_derived_resource
             left join iiif_metadata im on iiif_derived_resource.resource_id = im.resource_id
    where resource_type = 'collection'
      and iiif_derived_resource.site_id = ${siteId}
      and im.site_id = ${siteId}
      and im.key = ${field} 
      ${language ? sql`and im.language = ${language}` : sql``}
      and im.value ilike ${`${query}%`} 
    limit ${results}
  `;
}
