import { sql, TaggedTemplateLiteralInvocationType } from 'slonik';
import { getViewingDirection } from '../../utility/get-viewing-direction';
import { createMetadataReducer, MetadataField, metadataReducer } from '../../utility/iiif-metadata';
import { SQL_EMPTY, SQL_INT_ARRAY } from '../../utility/postgres-tags';

type ManifestAggregate = TaggedTemplateLiteralInvocationType<{
  manifest_id: number;
  canvas_id: number;
  canvas_count: number;
  canvas_thumbnail: string;
  published: boolean;
}>;

export function getSingleManifest({
  manifestId,
  siteId,
  perPage,
  page,
  excludeCanvases,
}: {
  manifestId: number;
  siteId: number;
  perPage: number;
  page: number;
  excludeCanvases?: string[];
}): ManifestAggregate {
  const offset = (page - 1) * perPage;

  const canvasExclusion = excludeCanvases
    ? sql`and canvas_links.item_id = any(${sql.array(excludeCanvases, SQL_INT_ARRAY)}) is false`
    : SQL_EMPTY;

  return sql<{
    manifest_id: number;
    canvas_id: number;
    canvas_count: number;
    canvas_thumbnail: string;
    task_id?: string;
    task_complete?: boolean;
    rights: string | null;
    viewing_direction: number;
    source: string;
  }>`
      select ${manifestId}::int                         as manifest_id,
             canvas_links.item_id                       as canvas_id,
             manifest_count.item_total                  as canvas_count,
             canvas_resources.default_thumbnail         as canvas_thumbnail,
             manifest.task_id                           as task_id,
             manifest.task_complete                     as task_complete,
             manifest.published                         as published,
             manifest_resource.rights                   as rights,
             manifest_resource.viewing_direction        as viewing_direction,
             manifest_resource.source                   as source
      from iiif_derived_resource manifest
            left join iiif_resource manifest_resource on manifest.resource_id = manifest_resource.id
            left join iiif_derived_resource_items canvas_links on manifest.resource_id = canvas_links.resource_id and canvas_links.site_id = ${siteId} ${canvasExclusion}
            left join iiif_resource canvas_resources on canvas_links.item_id = canvas_resources.id
            left join iiif_derived_resource_item_counts manifest_count
                         on manifest_count.resource_id = ${manifestId} and manifest_count.site_id = ${siteId}
      where manifest.resource_id = ${manifestId}
        and manifest.site_id = ${siteId}
        and manifest.resource_type = 'manifest' 
        and canvas_resources.type = 'canvas'
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

  // Other properties.
  manifest_source: string | null;
  manifest_rights: string | null;
  manifest_viewing_direction: number;
};

export function getManifestSnippets(
  query: ManifestAggregate,
  { fields, siteId, allManifestFields }: { fields?: string[]; siteId: number; allManifestFields: boolean }
) {
  return sql<ManifestSnippetsRow>`
      select
           manifest_aggregate.manifest_id as manifest_id,
           manifest_thumbnail(${siteId}, manifest_aggregate.manifest_id) as thumbnail,
           (manifest_aggregate.canvas_id = metadata.resource_id) as is_canvas,
           manifest_aggregate.canvas_thumbnail as canvas_thumbnail,
           manifest_aggregate.canvas_id as canvas_id,
           manifest_aggregate.canvas_count as canvas_count,
           manifest_aggregate.published as published,
           manifest_aggregate.rights                   as manifest_rights,
           manifest_aggregate.viewing_direction        as manifest_viewing_direction,
           manifest_aggregate.source                   as manifest_source,
           metadata.id as metadata_id,
           metadata.key as key,
           metadata.value as value,
           metadata.language as language,
           metadata.source as source,
           metadata.resource_id as resource_id
      from (${query}) manifest_aggregate(manifest_id, canvas_id, canvas_count, canvas_thumbnail, task_id, task_complete, published, rights, viewing_direction, source)
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

export function getCanvasFilter(
  filterId: string
): TaggedTemplateLiteralInvocationType<{ resource_id: number }> | undefined {
  switch (filterId) {
    case 'ocr_alto':
      return sql`
        select resource_id
        from iiif_linking
        where property = 'seeAlso'
          and (
              properties ->> 'profile' = 'http://www.loc.gov/standards/alto/v3/alto.xsd' or
              properties ->> 'profile' = 'http://www.loc.gov/standards/alto/v4/alto.xsd'
          )
      `;
    case 'ocr_hocr':
      return sql`
        select resource_id
        from iiif_linking
        where property = 'seeAlso'
          and (
            properties ->> 'profile' ilike 'http://kba.cloud/hocr-spec%' or 
            properties ->> 'profile' ilike 'http://kba.github.io/hocr-spec/%' or 
            properties ->> 'profile' = 'https://github.com/kba/hocr-spec/blob/master/hocr-spec.md' 
          )
      `;
    default:
      return undefined;
  }
}

export function getManifestList({
  siteId,
  page,
  manifestCount,
  parentId,
  canvasSubQuery,
  labelQuery,
  onlyPublished,
}: {
  siteId: number;
  page: number;
  manifestCount: number;
  parentId?: number;
  onlyPublished?: boolean;
  canvasSubQuery?: TaggedTemplateLiteralInvocationType<{ resource_id: number }>;
  labelQuery?: string;
}) {
  if (canvasSubQuery) {
    const parentJoin = parentId
      ? sql`left join iiif_derived_resource_items midr
                 on midr.item_id = ir.resource_id`
      : SQL_EMPTY;

    const parentWhere = parentId
      ? sql`
        and midr.resource_id = ${parentId}
        and midr.site_id = ${siteId}
      `
      : SQL_EMPTY;

    return sql<{ resource_id: number; thumbnail: string; canvas_total: number }>`
        with canvases (resource_id) as (${canvasSubQuery})
        select 
           ir.resource_id, 
           manifest_thumbnail(1, ir.resource_id) as thumbnail,
           canvas_count.item_total as canvas_total
        from canvases 
            left join iiif_derived_resource_items ir on item_id = canvases.resource_id and ir.site_id = ${siteId}
            left join iiif_resource i on ir.resource_id = i.id
            left join iiif_derived_resource_item_counts canvas_count
                   on canvas_count.resource_id = i.id and canvas_count.site_id = ${siteId}
            ${parentJoin}
        where i.type = 'manifest'
        ${parentWhere}
        group by ir.resource_id, i.type, canvas_count.item_total
        limit ${manifestCount} offset ${(page - 1) * manifestCount}
    `;
  }

  if (parentId) {
    return sql<{ resource_id: number; thumbnail: string; canvas_total: number }>`
      select manifests.resource_id as resource_id, manifest_thumbnail(${siteId}, manifests.resource_id) as thumbnail, canvas_count.item_total as canvas_total, manifests.published as published
      from iiif_derived_resource manifests
      left join iiif_derived_resource_items midr 
          on midr.item_id = manifests.resource_id
      left join iiif_derived_resource_item_counts canvas_count
           on canvas_count.resource_id = manifests.resource_id and canvas_count.site_id = ${siteId}
      where manifests.resource_type = 'manifest' 
        and manifests.site_id = ${siteId}
        ${onlyPublished ? sql`and manifests.published = true` : SQL_EMPTY}
        and midr.resource_id = ${parentId}
        and midr.site_id = ${siteId}
      limit ${manifestCount} offset ${(page - 1) * manifestCount}
  `;
  }

  if (labelQuery) {
    return sql<{ resource_id: number; thumbnail: string; canvas_total: number }>`
    select manifests.resource_id as resource_id, manifest_thumbnail(${siteId}, manifests.resource_id) as thumbnail, canvas_count.item_total as canvas_total, manifests.published as published
    from iiif_derived_resource manifests
    left join iiif_derived_resource_item_counts canvas_count
         on canvas_count.resource_id = manifests.resource_id and canvas_count.site_id = ${siteId}
    left join iiif_metadata im
         on manifests.resource_id = im.resource_id and im.site_id = ${siteId} and im.key = 'label'
             and im.value ilike '%' || ${labelQuery} || '%'
    where manifests.resource_type = 'manifest' 
      and manifests.site_id = ${siteId}
      ${onlyPublished ? sql`and manifests.published = true` : SQL_EMPTY}
      and im.resource_id is not null
      limit ${manifestCount} offset ${(page - 1) * manifestCount}
  `;
  }

  return sql<{ resource_id: number; thumbnail: string; canvas_total: number }>`
    select manifests.resource_id as resource_id, manifest_thumbnail(${siteId}, manifests.resource_id) as thumbnail, canvas_count.item_total as canvas_total, manifests.published as published
    from iiif_derived_resource manifests
    left join iiif_derived_resource_item_counts canvas_count
         on canvas_count.resource_id = manifests.resource_id and canvas_count.site_id = ${siteId}
    left join iiif_metadata im
         on manifests.resource_id = im.resource_id and im.site_id = ${siteId} and im.key = 'label'
    where manifests.resource_type = 'manifest' 
      and manifests.site_id = ${siteId}
      ${onlyPublished ? sql`and manifests.published = true` : SQL_EMPTY} 
      and im.resource_id is not null
      limit ${manifestCount} offset ${(page - 1) * manifestCount}
  `;
}

export const manifestReducer = createMetadataReducer((next: MetadataField & ManifestSnippetsRow) => ({
  id: next.resource_id,
  type: next.resource_type,
  created: next.created_at,
  thumbnail: next.thumbnail,
  published: next.published,
  source: next.manifest_source,
  viewingDirection: getViewingDirection(next.manifest_viewing_direction),
}));

export function mapManifestSnippets(rows: readonly ManifestSnippetsRow[]) {
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
        if (row.canvas_id && state.manifest_to_canvas[row.manifest_id].indexOf(row.canvas_id) === -1) {
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
        manifests: manifestReducer(state.manifests, row),
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
