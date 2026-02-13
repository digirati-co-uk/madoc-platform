--search-index-export-performance (up)

create index if not exists iiif_project_site_collection_idx
  on iiif_project (site_id, collection_id);

create index if not exists iiif_derived_resource_site_type_published_flat_resource_idx
  on iiif_derived_resource (site_id, resource_type, published, flat, resource_id);

create index if not exists iiif_derived_resource_items_site_item_resource_idx
  on iiif_derived_resource_items (site_id, item_id, resource_id);

create index if not exists iiif_derived_resource_items_site_resource_item_index_item_idx
  on iiif_derived_resource_items (site_id, resource_id, item_index, item_id);

create index if not exists iiif_metadata_site_resource_key_idx
  on iiif_metadata (site_id, resource_id, key);

create index if not exists capture_model_site_id_idx
  on capture_model (site_id);

create index if not exists capture_model_target_jsonb_idx
  on capture_model using gin (target jsonb_path_ops);
