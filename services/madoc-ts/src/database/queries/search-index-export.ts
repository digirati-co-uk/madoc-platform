import { sql } from 'slonik';

export interface SearchExportMetadataField {
  key: string;
  value: string | null;
  language: string;
  source: string;
  data: unknown;
}

export interface ManifestSearchExportRow {
  resource_id: number;
  resource_type: 'Manifest' | 'Canvas';
  item_index: number | null;
  source: string | null;
  rights: string | null;
  nav_date: Date | null;
  thumbnail: string | null;
  default_thumbnail: string | null;
  placeholder_image: string | null;
  primary_manifest_id: number | null;
  manifest_ids: number[];
  project_ids: number[];
  collection_ids: number[];
  metadata: SearchExportMetadataField[];
}

export interface SearchExportCaptureModelRow {
  model_id: string;
  target_id: string;
  document_data: unknown;
}

function resourceScopeContext(siteId: number) {
  return sql`
    scope_context as (
      select
        rs.resource_id,
        rs.resource_type,
        coalesce(pm.manifest_ids, ARRAY[]::int[]) as manifest_ids,
        coalesce(
          array_agg(distinct case when col.flat = false then col.resource_id end)
            filter (where col.flat = false and col.resource_id is not null),
          ARRAY[]::int[]
        ) as collection_ids,
        coalesce(
          array_agg(distinct project.id)
            filter (where project.id is not null),
          ARRAY[]::int[]
        ) as project_ids,
        case
          when rs.resource_type = 'Manifest' then rs.resource_id
          when coalesce(array_length(pm.manifest_ids, 1), 0) = 0 then null
          else pm.manifest_ids[1]
        end as primary_manifest_id
      from resource_scope rs
      left join lateral (
        select
          array_agg(distinct manifest_match.manifest_id order by manifest_match.manifest_id) as manifest_ids
        from (
          select rs.resource_id as manifest_id
          where rs.resource_type = 'Manifest'
          union
          select manifest_link.resource_id as manifest_id
          from iiif_derived_resource_items manifest_link
          inner join iiif_derived_resource manifest_resource
            on manifest_resource.resource_id = manifest_link.resource_id
           and manifest_resource.site_id = ${siteId}
           and manifest_resource.resource_type = 'manifest'
           and manifest_resource.published = true
          where manifest_link.site_id = ${siteId}
            and manifest_link.item_id = rs.resource_id
        ) manifest_match
      ) pm on true
      left join unnest(coalesce(pm.manifest_ids, ARRAY[]::int[])) as context_manifest(manifest_id) on true
      left join iiif_derived_resource_items collection_link
        on collection_link.site_id = ${siteId}
       and collection_link.item_id = context_manifest.manifest_id
      left join iiif_derived_resource col
        on col.resource_id = collection_link.resource_id
       and col.site_id = ${siteId}
       and col.resource_type = 'collection'
      left join iiif_project project
        on project.site_id = ${siteId}
       and project.collection_id = collection_link.resource_id
       and col.flat = true
      group by rs.resource_id, rs.resource_type, pm.manifest_ids
    )
  `;
}

export function getManifestResourcesForSearchExport(manifestId: number, siteId: number) {
  return sql<ManifestSearchExportRow>`
    with manifest as (
      select dr.resource_id
      from iiif_derived_resource dr
      where dr.site_id = ${siteId}
        and dr.resource_type = 'manifest'
        and dr.resource_id = ${manifestId}
      limit 1
    ),
    resource_scope as (
      select
        m.resource_id,
        'Manifest'::text as resource_type,
        null::int as item_index
      from manifest m
      union all
      select
        dri.item_id as resource_id,
        'Canvas'::text as resource_type,
        dri.item_index
      from iiif_derived_resource_items dri
      inner join manifest m on m.resource_id = dri.resource_id
      where dri.site_id = ${siteId}
    ),
    ${resourceScopeContext(siteId)},
    resource_base as (
      select
        rs.resource_id,
        rs.resource_type,
        rs.item_index,
        r.source,
        r.rights,
        r.nav_date,
        r.default_thumbnail,
        r.placeholder_image,
        sc.primary_manifest_id,
        sc.manifest_ids,
        sc.project_ids,
        sc.collection_ids
      from resource_scope rs
      inner join iiif_resource r on r.id = rs.resource_id
      inner join scope_context sc on sc.resource_id = rs.resource_id
    )
    select
      rb.resource_id,
      rb.resource_type,
      rb.item_index,
      rb.source,
      rb.rights,
      rb.nav_date,
      case
        when rb.resource_type = 'Manifest' then manifest_thumbnail(${siteId}, rb.resource_id)
        else coalesce(rb.default_thumbnail, rb.placeholder_image, manifest_thumbnail(${siteId}, rb.primary_manifest_id))
      end as thumbnail,
      rb.default_thumbnail,
      rb.placeholder_image,
      rb.primary_manifest_id,
      rb.manifest_ids,
      rb.project_ids,
      rb.collection_ids,
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'key', m.key,
            'value', m.value,
            'language', m.language,
            'source', m.source,
            'data', m.data
          )
        ) filter (where m.id is not null),
        '[]'::jsonb
      ) as metadata
    from resource_base rb
    left join iiif_metadata m on m.resource_id = rb.resource_id and m.site_id = ${siteId}
    group by
      rb.resource_id,
      rb.resource_type,
      rb.item_index,
      rb.source,
      rb.rights,
      rb.nav_date,
      case
        when rb.resource_type = 'Manifest' then manifest_thumbnail(${siteId}, rb.resource_id)
        else coalesce(rb.default_thumbnail, rb.placeholder_image, manifest_thumbnail(${siteId}, rb.primary_manifest_id))
      end,
      rb.default_thumbnail,
      rb.placeholder_image,
      rb.primary_manifest_id,
      rb.manifest_ids,
      rb.project_ids,
      rb.collection_ids
    order by
      case when rb.resource_type = 'Manifest' then 0 else 1 end asc,
      rb.item_index asc nulls first
  `;
}

export function getCanvasResourceForSearchExport(canvasId: number, siteId: number) {
  return sql<ManifestSearchExportRow>`
    with resource_scope as (
      select
        ${canvasId}::int as resource_id,
        'Canvas'::text as resource_type,
        (
          select min(dri.item_index)
          from iiif_derived_resource_items dri
          inner join iiif_derived_resource manifest_resource
            on manifest_resource.resource_id = dri.resource_id
           and manifest_resource.site_id = ${siteId}
           and manifest_resource.resource_type = 'manifest'
           and manifest_resource.published = true
          where dri.site_id = ${siteId}
            and dri.item_id = ${canvasId}
        ) as item_index
    ),
    ${resourceScopeContext(siteId)},
    resource_base as (
      select
        rs.resource_id,
        rs.resource_type,
        rs.item_index,
        r.source,
        r.rights,
        r.nav_date,
        r.default_thumbnail,
        r.placeholder_image,
        sc.primary_manifest_id,
        sc.manifest_ids,
        sc.project_ids,
        sc.collection_ids
      from resource_scope rs
      inner join iiif_resource r on r.id = rs.resource_id and r.type = 'canvas'
      inner join scope_context sc on sc.resource_id = rs.resource_id
    )
    select
      rb.resource_id,
      rb.resource_type,
      rb.item_index,
      rb.source,
      rb.rights,
      rb.nav_date,
      coalesce(rb.default_thumbnail, rb.placeholder_image, manifest_thumbnail(${siteId}, rb.primary_manifest_id)) as thumbnail,
      rb.default_thumbnail,
      rb.placeholder_image,
      rb.primary_manifest_id,
      rb.manifest_ids,
      rb.project_ids,
      rb.collection_ids,
      coalesce(
        jsonb_agg(
          jsonb_build_object(
            'key', m.key,
            'value', m.value,
            'language', m.language,
            'source', m.source,
            'data', m.data
          )
        ) filter (where m.id is not null),
        '[]'::jsonb
      ) as metadata
    from resource_base rb
    left join iiif_metadata m on m.resource_id = rb.resource_id and m.site_id = ${siteId}
    group by
      rb.resource_id,
      rb.resource_type,
      rb.item_index,
      rb.source,
      rb.rights,
      rb.nav_date,
      coalesce(rb.default_thumbnail, rb.placeholder_image, manifest_thumbnail(${siteId}, rb.primary_manifest_id)),
      rb.default_thumbnail,
      rb.placeholder_image,
      rb.primary_manifest_id,
      rb.manifest_ids,
      rb.project_ids,
      rb.collection_ids
    limit 1
  `;
}

export function getCaptureModelDataForSearchExport(siteId: number, targetIds: string[]) {
  if (!targetIds.length) {
    return sql<SearchExportCaptureModelRow>`
      select
        null::text as model_id,
        null::text as target_id,
        null::jsonb as document_data
      where false
    `;
  }

  return sql<SearchExportCaptureModelRow>`
    select distinct
      cm.id as model_id,
      target.id as target_id,
      cmd.document_data as document_data
    from capture_model cm
    inner join capture_model_document cmd
      on cmd.id = cm.document_id
     and cmd.site_id = ${siteId}
    inner join lateral jsonb_to_recordset(coalesce(cm.target, '[]'::jsonb)) as target(id text, type text)
      on true
    where cm.site_id = ${siteId}
      and target.id = any(${sql.array(targetIds, 'text')})
      and lower(coalesce(target.type, '')) in ('manifest', 'canvas')
    order by target.id, cm.id
  `;
}
