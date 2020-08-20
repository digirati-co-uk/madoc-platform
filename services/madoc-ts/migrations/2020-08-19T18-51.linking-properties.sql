--linking-properties (up)
create table iiif_linking
(
    id          serial                              not null
        constraint iiif_linking_pk
            primary key,
    uri         text                                not null,
    type        text,
    label       text,
    property    text                                not null,
    source      text,
    file_path   text,
    file_bucket text,
    file_hash   text,
    motivation  text,
    format      text,
    properties  jsonb,
    modified_at timestamp default CURRENT_TIMESTAMP not null,
    created_at  timestamp default CURRENT_TIMESTAMP not null,
    site_id     integer,
    resource_id integer                             not null
        constraint iiif_linking_iiif_resource_id_fk
            references iiif_resource
            on delete cascade
);

alter table iiif_linking
    owner to madoc_ts;

create unique index iiif_linking_uri_resource_id_uindex
    on iiif_linking (uri, resource_id);

