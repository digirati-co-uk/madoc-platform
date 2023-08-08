--user-extensions (up)

alter table "user" add column user_info jsonb;
alter table "user" add column user_preferences jsonb;

create table site_terms
(
    id             uuid primary key,
    site_id        integer references site (id),
    created_at     timestamp not null default CURRENT_TIMESTAMP,
    terms_markdown text not null,
    terms_text     text not null
);

alter table "user" add column terms_accepted uuid[];

create table badge
(
    id           uuid primary key,
    site_id      integer references site (id),
    label        jsonb not null,
    description  jsonb,
    svg_code     text,
    tier_colors  text[],
    trigger_name text,
    created_at   timestamp,
    updated_at   timestamp
);

create table badge_award
(
    id          uuid primary key,
    site_id     integer references site (id) not null,
    user_id     integer references "user" (id) not null,
    project_id  integer references iiif_project (id),
    badge_id    uuid references badge (id),
    awarded_by  integer references "user" (id),
    reason      text,
    tier        int,
    awarded_at  timestamp not null default CURRENT_TIMESTAMP
);
