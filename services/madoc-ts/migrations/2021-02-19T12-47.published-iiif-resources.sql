--published-iiif-resources (up)
alter table iiif_derived_resource
    add published boolean default true not null;
