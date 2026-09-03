--full-search-reindex-pagination (up)

create index if not exists iiif_derived_resource_site_type_reindex_idx
  on iiif_derived_resource (site_id, resource_type, resource_id);

create index if not exists iiif_project_site_reindex_idx
  on iiif_project (site_id, id);
