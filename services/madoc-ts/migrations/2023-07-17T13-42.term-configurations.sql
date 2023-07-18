--term-configurations (up)

create table term_configurations (
    id uuid primary key,
    url_pattern text not null,
    results_path text not null,
    label_path text not null,
    uri_path text not null,
    resource_class_path text,
    description_path text,
    language_path text,
    term_label text not null,
    term_description text,
    attribution text,
    site_id integer not null,
    creator integer not null,
    created_at timestamp not null
);

create index term_configurations_site_id on term_configurations (site_id);

