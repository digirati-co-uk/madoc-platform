--performance (up)

-- Drop existing views.
drop view if exists iiif_derived_flat_collection_counts;

-- Replace view with materialised view.
drop view if exists iiif_derived_resource_item_counts;

create materialized view iiif_derived_resource_item_counts (resource_id, site_id, item_total) as
select resource_id, site_id, count(distinct item_id)
from iiif_derived_resource_items
group by (resource_id, site_id);

-- Create indexes on new counts view
create index iiif_derived_resource_item_counts_site_id ON iiif_derived_resource_item_counts (site_id);
create index iiif_derived_resource_item_counts_resource_id ON iiif_derived_resource_item_counts (resource_id);
create unique index iiif_derived_resource_item_counts_unique ON iiif_derived_resource_item_counts (resource_id, site_id);

-- Recreate second view
CREATE materialized view iiif_derived_flat_collection_counts (canvas_total, manifest_total, flat_collection_id, site_id) as
SELECT DISTINCT sum(idric.item_total)             AS canvas_total,
                count(DISTINCT idric.resource_id) AS manifest_total,
                ir.resource_id                    AS flat_collection_id,
                ir.site_id
FROM iiif_derived_resource ir
         LEFT JOIN iiif_derived_resource_items idr ON idr.resource_id = ir.resource_id and ir.site_id = idr.site_id
         LEFT JOIN iiif_derived_resource manifest ON idr.item_id = manifest.resource_id and ir.site_id = manifest.site_id
         LEFT JOIN iiif_derived_resource_item_counts idric ON idr.item_id = idric.resource_id and ir.site_id = idric.site_id
WHERE manifest.resource_type = 'manifest'::text
  AND ir.resource_type = 'collection'::text
  AND ir.flat = true
GROUP BY ir.resource_id, ir.site_id;

create unique index iiif_derived_flat_collection_counts_unique ON iiif_derived_flat_collection_counts (flat_collection_id, site_id);

-- Function to refresh view
CREATE OR REPLACE FUNCTION refresh_item_counts(
)
    RETURNS BOOLEAN
    LANGUAGE plpgsql
AS
$$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY iiif_derived_resource_item_counts;
    REFRESH MATERIALIZED VIEW CONCURRENTLY iiif_derived_flat_collection_counts;
    RETURN true;
END
$$;

-- Add more indexes on items
create index iiif_derived_resource_items_full_index
    on iiif_derived_resource_items (item_index);

create index iiif_derived_resource_items_full_iid
    on iiif_derived_resource_items (item_id);
