alter table iiif_derived_resource
    add column extra_properties jsonb not null default '{}'::jsonb,
    add column iiif_updated_at timestamptz not null default now();

-- Canonical resources can belong to several sites and use one URL in several properties.
drop index iiif_linking_uri_resource_id_uindex;
create unique index iiif_linking_uri_resource_site_property_uindex
    on iiif_linking (uri, resource_id, coalesce(site_id, -1), property);

create table iiif_annotation_text (
    page_id integer not null references iiif_linking(id) on delete cascade,
    site_id integer not null,
    canvas_id integer not null references iiif_resource(id) on delete cascade,
    language text not null default 'none',
    text text not null,
    primary key (page_id, site_id, canvas_id, language)
);
create index iiif_annotation_text_canvas_site_idx on iiif_annotation_text (canvas_id, site_id);
