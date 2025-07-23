import { sql, TaggedTemplateLiteralInvocationType } from 'slonik';
import { SQL_EMPTY } from '../../utility/postgres-tags';

export function countSubQuery(query: TaggedTemplateLiteralInvocationType<{ resource_id: number }>) {
  return sql`with t (resource_id) as (${query}) select COUNT(*) from t left join iiif_derived_resource_items ri on t.resource_id = ri.item_id group by ri.resource_id`;
}

export function countResources({
  labelQuery,
  parent_id,
  resource_type,
  site_id,
  showFlat,
  onlyPublished,
}: {
  resource_type: string;
  site_id: number;
  parent_id?: number;
  showFlat?: boolean;
  onlyPublished?: boolean;
  labelQuery?: string;
}) {
  if (parent_id) {
    return sql<{ total: number }>`
    select count(*) as total
      from iiif_derived_resource cidr
        left join iiif_derived_resource_items cidri 
            on cidr.resource_id = cidri.item_id
      where cidr.resource_type = ${resource_type} 
      and cidr.site_id = ${site_id}
      ${showFlat ? SQL_EMPTY : sql`and cidr.flat = false`}
      ${onlyPublished ? sql`and cidr.published = true` : SQL_EMPTY}
      and cidri.resource_id = ${parent_id}
  `;
  }

  if (labelQuery) {
    return sql<{ total: number }>`
    select count(*) as total
      from iiif_derived_resource
      left join iiif_metadata im
         on iiif_derived_resource.resource_id = im.resource_id and im.site_id = ${site_id} and im.key = 'label'
             and im.value ilike '%' || ${labelQuery} || '%'
      where resource_type = ${resource_type} 
      and im.resource_id is not null
      and iiif_derived_resource.site_id = ${site_id}
      ${showFlat ? SQL_EMPTY : sql`and flat = false`}
      ${onlyPublished ? sql`and published = true` : SQL_EMPTY}
  `;
  }

  return sql<{ total: number }>`
    select count(*) as total
      from iiif_derived_resource
      where resource_type = ${resource_type} 
      and site_id = ${site_id}
      ${showFlat ? SQL_EMPTY : sql`and flat = false`}
      ${onlyPublished ? sql`and published = true` : SQL_EMPTY}
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

export function getParentResources(resourceId: string, siteId: number, projectId?: string, flat?: boolean) {
  if (projectId) {
    return sql<{ resource_id: number }>`
        select parent_resources.resource_id
        from iiif_derived_resource_items parent_resources
        left join iiif_derived_resource_items projectLinks on
            parent_resources.resource_id = projectLinks.item_id
       left join iiif_derived_resource res on
            parent_resources.resource_id = res.resource_id
        left join iiif_project project on
            project.collection_id = projectLinks.resource_id
        where parent_resources.item_id = ${resourceId}
        and projectLinks.site_id = ${siteId}
        and parent_resources.site_id = ${siteId}
        ${typeof flat === 'undefined' ? SQL_EMPTY : sql`and res.flat = ${flat}`}
        and project.site_id = ${siteId}
        and project.id = ${projectId}
    `;
  }

  return sql<{ resource_id: number; item_id: number }>`
      select parent_resources.resource_id, parent_resources.item_id 
      from iiif_derived_resource_items parent_resources
       left join iiif_derived_resource res on
          parent_resources.resource_id = res.resource_id
      where parent_resources.item_id = ${resourceId}
        ${typeof flat === 'undefined' ? SQL_EMPTY : sql`and res.flat = ${flat}`}
        and parent_resources.site_id = ${siteId} 
  `;
}

export function getResourceLocalSource(resourceId: number) {
  return sql<{ local_source: string }>`
    select local_source from iiif_resource where id = ${resourceId};
  `;
}

export function createAnnotation(annotation: any, siteId: number, userId: number) {
  return sql`select create_annotation(${sql.json(annotation)}, ${siteId}, ${userId})`;
}

export function addCanvasAnnotations(canvasId: number, annotationIds: number[], siteId: number) {
  return sql`select add_canvas_annotations(${canvasId}, ${sql.array(annotationIds, 'int4')}, ${siteId})`;
}
