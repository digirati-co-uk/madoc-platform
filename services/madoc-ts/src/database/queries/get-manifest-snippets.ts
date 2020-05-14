import { sql, SqlSqlTokenType } from 'slonik';
import { metadataReducer } from '../../utility/iiif-metadata';

type ManifestAggregate = SqlSqlTokenType<{
  manifest_id: number;
  canvas_id: number;
  canvas_count: number;
  canvas_thumbnail: string;
}>;

export function getSingleManifest({
  manifestId,
  siteId,
  perPage,
  page,
}: {
  manifestId: number;
  siteId: number;
  perPage: number;
  page: number;
}): ManifestAggregate {
  const offset = (page - 1) * perPage;
  return sql<{
    manifest_id: number;
    canvas_id: number;
    canvas_count: number;
    canvas_thumbnail: string;
    task_id?: string;
    task_complete?: boolean;
  }>`
    with site_counts as (select * from iiif_derived_resource_item_counts where site_id = ${siteId})
      select ${manifestId}::int                         as manifest_id,
             canvas_links.item_id                       as canvas_id,
             manifest_count.item_total                  as canvas_count,
             canvas_resources.default_thumbnail         as canvas_thumbnail,
             manifest.task_id                           as task_id,
             manifest.task_complete                     as task_complete
      from iiif_derived_resource manifest
            left join iiif_derived_resource_items canvas_links on manifest.resource_id = canvas_links.resource_id and canvas_links.site_id = ${siteId}
            left join iiif_resource canvas_resources on canvas_links.item_id = canvas_resources.id
            left join site_counts manifest_count
                         on manifest_count.resource_id = ${manifestId}
      where manifest.resource_id = ${manifestId}
        and manifest.site_id = ${siteId}
      order by canvas_links.item_index
      limit ${perPage}
      offset ${offset}
  `;
}

export type ManifestSnippetsRow = {
  manifest_id: number;
  canvas_id: number;
  metadata_id: number;
  is_canvas: boolean;
  canvas_thumbnail: string | null;
  key: string;
  value: string;
  language: string;
  source: string;
  resource_id: number;
  canvas_count?: number;
};

export function getManifestSnippets(
  query: ManifestAggregate,
  { fields, siteId, allManifestFields }: { fields: string[]; siteId: number; allManifestFields: boolean }
) {
  return sql<ManifestSnippetsRow>`
      select
           manifest_aggregate.manifest_id as manifest_id,
           (manifest_aggregate.canvas_id = metadata.resource_id) as is_canvas,
           manifest_aggregate.canvas_thumbnail as canvas_thumbnail,
           manifest_aggregate.canvas_id as canvas_id,
           manifest_aggregate.canvas_count as canvas_count,
           metadata.id as metadata_id,
           metadata.key as key,
           metadata.value as value,
           metadata.language as language,
           metadata.source as source,
           metadata.resource_id as resource_id
      from (${query}) manifest_aggregate
          left join iiif_metadata metadata
              on (manifest_aggregate.canvas_id = metadata.resource_id or
                 manifest_aggregate.manifest_id = metadata.resource_id)
                 and metadata.site_id = ${siteId} 
          ${fields && !allManifestFields ? sql`and metadata.key = ANY (${sql.array(fields, 'text')})` : sql``} 
          ${
            fields && allManifestFields
              ? sql`and (
              (manifest_aggregate.canvas_id = metadata.resource_id) = false 
                or metadata.key = ANY (${sql.array(fields, 'text')})
              )`
              : sql``
          }
  `;
}

export function mapManifestSnippets(rows: ManifestSnippetsRow[]) {
  return rows.reduce(
    (state, row) => {
      if (state.metadata_ids.indexOf(row.metadata_id) !== -1) {
        return state;
      }

      state.metadata_ids.push(row.metadata_id);

      if (row.is_canvas) {
        if (!state.manifest_to_canvas[row.manifest_id]) {
          state.manifest_to_canvas[row.manifest_id] = [];
        }
        if (state.manifest_to_canvas[row.manifest_id].indexOf(row.canvas_id) === -1) {
          state.manifest_to_canvas[row.manifest_id].push(row.canvas_id);
        }

        const canvases = metadataReducer(state.canvases, row);

        // Add any extra rows.
        canvases[row.resource_id].thumbnail = row.canvas_thumbnail;

        return {
          manifest_to_canvas: state.manifest_to_canvas,
          canvases,
          manifests: state.manifests,
          metadata_ids: state.metadata_ids,
        };
      }

      if (row.resource_id === null && row.manifest_id) {
        // When there is no metadata.
        row.key = 'label';
        row.resource_id = row.manifest_id;
        row.language = 'none';
        row.value = 'Untitled';
      }


      return {
        manifest_to_canvas: state.manifest_to_canvas,
        canvases: state.canvases,
        manifests: metadataReducer(state.manifests, row),
        metadata_ids: state.metadata_ids,
      };
    },
    {
      manifests: {},
      canvases: {},
      manifest_to_canvas: {},
      metadata_ids: [],
    } as {
      manifests: any;
      canvases: any;
      manifest_to_canvas: any;
      metadata_ids: number[];
    }
  );
}
