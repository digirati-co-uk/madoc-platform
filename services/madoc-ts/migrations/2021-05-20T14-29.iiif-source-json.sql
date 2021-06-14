--iiif-source-json (up)
alter table iiif_resource
    add items_json json;

alter table iiif_resource
    add thumbnail_json json;
