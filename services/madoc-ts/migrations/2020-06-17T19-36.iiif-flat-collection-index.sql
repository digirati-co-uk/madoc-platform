--iiif-flat-collection-index (up)
drop view if exists iiif_derived_flat_collection_counts;
CREATE VIEW iiif_derived_flat_collection_counts (canvas_total, manifest_total, flat_collection_id, site_id) as
select distinct SUM(idric.item_total) as canvas_total, COUNT(distinct idric.resource_id) as manifest_total, ir.resource_id as flat_collection_id, ir.site_id as site_id
from iiif_derived_resource ir
         left join iiif_derived_resource_items idr on idr.resource_id = ir.resource_id
         left join iiif_derived_resource manifest on idr.item_id = manifest.resource_id
         left join iiif_derived_resource_item_counts idric on idr.item_id = idric.resource_id
where manifest.resource_type = 'manifest'
  and ir.resource_type = 'collection'
  and ir.flat = true
group by (ir.resource_id, ir.site_id);
