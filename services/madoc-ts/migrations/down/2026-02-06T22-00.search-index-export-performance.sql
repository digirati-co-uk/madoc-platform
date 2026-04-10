--search-index-export-performance (down)

drop index if exists iiif_project_site_collection_idx;

drop index if exists iiif_derived_resource_site_type_published_flat_resource_idx;

drop index if exists iiif_derived_resource_items_site_item_resource_idx;

drop index if exists iiif_derived_resource_items_site_resource_item_index_item_idx;

drop index if exists iiif_metadata_site_resource_key_idx;

drop index if exists capture_model_site_id_idx;

drop index if exists capture_model_target_jsonb_idx;
