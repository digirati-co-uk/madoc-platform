--performance (down)

-- Undo view.
drop materialized view if exists iiif_derived_flat_collection_counts;
drop materialized view if exists iiif_derived_resource_item_counts;

CREATE VIEW iiif_derived_resource_item_counts (resource_id, site_id, item_total) as
SELECT resource_id, site_id, COUNT(DISTINCT item_id)
FROM iiif_derived_resource_items
GROUP BY (resource_id, site_id);

CREATE VIEW iiif_derived_flat_collection_counts (canvas_total, manifest_total, flat_collection_id, site_id) as
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

-- Drop indexes
drop index iiif_derived_resource_items_full_index;
drop index iiif_derived_resource_items_full_iid;

-- Drop trigger
drop trigger if exists refresh_item_counts_trigger ON iiif_derived_resource_items;
drop trigger if exists refresh_flat_collection_item_counts_trigger ON iiif_derived_resource_items;

-- Drop function
drop function if exists refresh_iiif_derived_resource_item_counts;
drop function if exists refresh_iiif_derived_flat_collection_counts;
