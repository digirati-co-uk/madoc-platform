import { sql } from 'slonik';

export function getProjectsByResource(resourceType: string, resourceId: number, siteId: number) {
  return sql<{
    project_id: number;
    resource_type: string;
    metadata_id: number;
    key: string;
    value: string;
    language: string;
    source: string;
    resource_id: number;
  }>`
    select
        project.id as project_id,
        metadata.id as metadata_id,
        metadata.key,
        metadata.value,
        metadata.language,
        metadata.source,
        metadata.resource_id
    from iiif_derived_resource_items iri
             left join iiif_derived_resource ir on iri.item_id = ir.resource_id 
             left join iiif_project project on iri.site_id = project.site_id
             left join iiif_metadata metadata on project.collection_id = metadata.resource_id and metadata.site_id = project.site_id
    where iri.item_id = ${resourceId}
      and iri.site_id = ${siteId}
      and ir.resource_type = ${resourceType} 
      and project.collection_id = iri.resource_id
`;
}
