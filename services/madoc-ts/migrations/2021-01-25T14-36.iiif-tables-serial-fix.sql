--iiif-tables-serial-fix (up)

-- iiif_derived_resource
select setval('iiif_derived_resource_id_seq', (select max(id) from iiif_derived_resource));

-- iiif_linking
select setval('iiif_linking_id_seq', (select max(id) from iiif_linking));

-- iiif_metadata
select setval('iiif_metadata_id_seq', (select max(id) from iiif_metadata));

-- iiif_project
select setval('iiif_project_id_seq', (select max(id) from iiif_project));

-- iiif_resource
select setval('iiif_resource_id_seq', (select max(id) from iiif_resource));

-- jwt_site_scopes
select setval('jwt_site_scopes_id_seq', (select max(id) from jwt_site_scopes));
