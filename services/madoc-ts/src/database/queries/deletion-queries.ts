import { sql } from 'slonik';

export function deleteIiifMetadata(id: number) {
  return sql<{ resource_id: number; total: number }>`
    delete from iiif_metadata where resource_id = ${id};
  `;
}

export function deleteProjectMetadata(projectId: number) {
  return sql<{ resource_id: number; total: number }>`
    delete from iiif_metadata
    where resource_id = (select collection_id from iiif_project where id = ${projectId});
  `;
}
