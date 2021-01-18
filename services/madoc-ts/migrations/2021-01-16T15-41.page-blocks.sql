--page-blocks (up)

-- Site pages.
create table site_pages
(
    id serial not null
        constraint site_pages_pk
            primary key,
    path text not null,
    previous_paths text[],
    title json not null,
    navigation_title json,
    description json,
    created timestamp default CURRENT_TIMESTAMP not null,
    modified timestamp default CURRENT_TIMESTAMP,
    author_id text not null,
    author_name text not null,
    layout text,
    parent_page int
        constraint site_pages_site_pages_id_fk
            references site_pages
            on delete cascade,
    page_engine text,
    page_options json,
    is_post boolean,
    slug text not null default '',
    is_navigation_root boolean default false,
    hide_from_navigation boolean default false,
    include_in_search boolean default false,
    site_id int not null,
    unique (path, slug, site_id)
);

-- Site slots
create table site_slots
(
    id serial not null,
    slot_id text not null,
    slot_label json,
    slot_layout text,

    -- Filter projects
    filter_project_none boolean default true,
    filter_project_all boolean default false,
    filter_project_exact int,
    filter_project_whitelist int[],
    filter_project_blacklist int[],

    -- Filter collections
    filter_collection_none boolean default true,
    filter_collection_all boolean default false,
    filter_collection_exact int,
    filter_collection_whitelist int[],
    filter_collection_blacklist int[],

    -- Filter manifests
    filter_manifest_none boolean default true,
    filter_manifest_all boolean default false,
    filter_manifest_exact int,
    filter_manifest_whitelist int[],
    filter_manifest_blacklist int[],

    -- Filter canvases
    filter_canvas_none boolean default true,
    filter_canvas_all boolean default false,
    filter_canvas_exact int,
    filter_canvas_whitelist int[],
    filter_canvas_blacklist int[],
    specificity int not null,
    site_id int not null
);

create unique index site_slots_id_uindex
    on site_slots (id);

alter table site_slots
    add constraint site_slots_pk
        primary key (id);

-- Site page -> slots
create table site_page_slots
(
    slot_id int not null
        constraint site_page_slots_site_slots_id_fk
            references site_slots (id)
            on delete cascade,
    page_id int not null
        constraint site_page_slots_site_pages_id_fk
            references site_pages (id)
            on delete cascade
);

-- Blocks
create table site_block
(
    id serial not null,
    name text not null,
    type text not null,
    static_data json not null,
    lazy boolean default false not null,
    site_id int not null,
    i18n_languages text[],
    i18n_sort_key text,
    i18n_fallback boolean
);

create unique index site_block_id_uindex
    on site_block (id);

alter table site_block
    add constraint site_block_pk
        primary key (id);


-- Slot -> Block
create table site_slot_blocks
(
    slot_id int not null
        constraint site_slot_blocks_site_slots_id_fk
            references site_slots (id)
            on delete cascade,
    block_id int not null
        constraint site_slot_blocks_site_blocks_id_fk
            references site_block (id)
            on delete cascade,
    display_order int not null default 0
);
