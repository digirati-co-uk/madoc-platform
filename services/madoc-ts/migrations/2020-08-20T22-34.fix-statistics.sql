--fix-statistics (up)
drop view if exists iiif_derived_flat_collection_counts;
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
