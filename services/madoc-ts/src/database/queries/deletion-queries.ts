import { sql } from 'slonik';

export function deleteIiifMetadata(id: number, siteId?: number) {
  if (siteId) {
    return sql`
      delete from iiif_metadata where resource_id = ${id} and site_id = ${siteId};
    `;
  }
  return sql`
    delete from iiif_metadata where resource_id = ${id};
  `;
}

export function deleteProjectMetadata(projectId: number) {
  return sql`
    delete from iiif_metadata
    where resource_id = (select collection_id from iiif_project where id = ${projectId});
  `;
}

export function deleteIiifLinking(id: number, siteId?: number) {
  if (siteId) {
    return sql`
      delete from iiif_linking where resource_id = ${id} and site_id = ${siteId};
    `;
  }
  return sql`
    delete from iiif_linking where resource_id = ${id};
  `;
}

export function deleteIiifResourceItem(id: number) {
  return sql`
    delete from iiif_resource_items
    where item_id = ${id};
  `;
}

export function deleteParentIiifDerivedResourceItems(childId: number, siteId?: number) {
  if (siteId) {
    return sql`
      delete from iiif_derived_resource_items
      where item_id = ${childId}
      and site_id = ${siteId};
    `;
  }
  return sql`
    delete from iiif_derived_resource_items
    where item_id = ${childId};
  `;
}

export function deleteChildIiifDerivedResourceItems(parentId: number, siteId?: number) {
  if (siteId) {
    return sql`
      delete from iiif_derived_resource_items
      where resource_id = ${parentId}
      and site_id = ${siteId};
    `;
  }
  return sql`
    delete from iiif_derived_resource_items
    where resource_id = ${parentId};
  `;
}

export function deleteChildIiifDerivedResources(parentId: number, siteId?: number) {
  if (siteId) {
    return sql`
      delete from iiif_derived_resource
      where site_id = ${siteId}
      and resource_id in
        (select item_id from iiif_derived_resource_items idri where idri.resource_id = ${parentId});
    `;
  }
  return sql`
    delete from iiif_derived_resource
    where resource_id in
      (select item_id from iiif_derived_resource_items idri where idri.resource_id = ${parentId});
  `;
}

export function deleteIiifDerivedResource(id: number, siteId?: number) {
  if (siteId) {
    return sql`
      delete from iiif_derived_resource
      where resource_id = ${id}
      and site_id = ${siteId};
    `;
  }
  return sql`
    delete from iiif_derived_resource
    where resource_id = ${id};
  `;
}

export function deleteIiifResource(id: number) {
  return sql`
    delete from iiif_resource
    where id = ${id};
  `;
}

export function deleteProjectNotes(projectId: number) {
  return sql`
    delete from project_notes where project_id = ${projectId};
  `;
}

export function deleteProjectRecord(projectId: number) {
  return sql`
    delete from iiif_project where id = ${projectId};
  `;
}

export function getChildResourceIds(parentId: number, type: 'canvas' | 'manifest' | 'collection', unique = false) {
  if (unique) {
    return sql<{ item_id: number }>`
      select distinct item_id from iiif_resource_items
      join iiif_resource ir on iiif_resource_items.item_id = ir.id
      where iiif_resource_items.resource_id = ${parentId}
      and ir.type = ${type}
      and (select count(distinct resource_id) from iiif_resource_items where item_id = ir.id) = 1;
    `;
  }
  return sql<{ item_id: number }>`
    select distinct item_id from iiif_resource_items
    join iiif_resource ir on iiif_resource_items.item_id = ir.id
    where iiif_resource_items.resource_id = ${parentId}
    and ir.type = ${type};
  `;
}

export function getDerivedChildResourceIds(parentId: number, type: 'canvas' | 'manifest' | 'collection') {
  return sql<{ item_id: number }>`
    select distinct item_id from iiif_derived_resource_items
    join iiif_derived_resource ir on iiif_derived_resource_items.item_id = ir.resource_id
    where iiif_derived_resource_items.resource_id = ${parentId}
    and ir.resource_type = ${type};
  `;
}

export function getProjectAssociates(projectId: number) {
  return sql<{ collection_id: number; capture_model_id: string }>`
    select collection_id, capture_model_id from iiif_project where id = ${projectId};
  `;
}
