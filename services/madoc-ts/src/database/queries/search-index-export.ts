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
  default_thumbnail: string | null;
  placeholder_image: string | null;
  metadata: SearchExportMetadataField[];
}

export function getManifestResourcesForSearchExport(manifestId: number, siteId: number) {
  return sql<ManifestSearchExportRow>`
    with manifest as (
      select dr.resource_id
      from iiif_derived_resource dr
      where dr.site_id = ${siteId}
        and dr.resource_type = 'manifest'
        and dr.resource_id = ${manifestId}
    ),
    manifest_resources as (
      select m.resource_id as resource_id, 'Manifest'::text as resource_type, null::int as item_index
      from manifest m
      union all
      select dri.item_id as resource_id, 'Canvas'::text as resource_type, dri.item_index
      from iiif_derived_resource_items dri
      inner join manifest m on m.resource_id = dri.resource_id
      where dri.site_id = ${siteId}
    ),
    resource_base as (
      select
        mr.resource_id,
        mr.resource_type,
        mr.item_index,
        r.source,
        r.rights,
        r.nav_date,
        r.default_thumbnail,
        r.placeholder_image
      from manifest_resources mr
      inner join iiif_resource r on r.id = mr.resource_id
    )
    select
      rb.resource_id,
      rb.resource_type,
      rb.item_index,
      rb.source,
      rb.rights,
      rb.nav_date,
      rb.default_thumbnail,
      rb.placeholder_image,
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
      rb.default_thumbnail,
      rb.placeholder_image
    order by
      case when rb.resource_type = 'Manifest' then 0 else 1 end asc,
      rb.item_index asc nulls first
  `;
}
