--themes (up)
create table theme
(
    theme_id text not null,
    name text not null,
    description text,
    thumbnail text,
    version text not null,
    enabled boolean,
    created_at timestamp default CURRENT_TIMESTAMP not null,
    theme json
);

create unique index theme_theme_id_uindex
    on theme (theme_id);

alter table theme
    add constraint theme_pk
        primary key (theme_id);

create table theme_site
(
    theme_id text not null
        constraint theme_site_theme_theme_id_fk
            references theme
            on update cascade on delete cascade,
    site_id int,
    constraint theme_site_pk
        primary key (theme_id, site_id)
);

