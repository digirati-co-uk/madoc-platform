--jwt_site_scopes (up)
create table jwt_site_scopes
(
    id serial not null
        constraint jwt_site_scopes_pk
            primary key,

    site_id             integer not null,
    created_at          timestamp default CURRENT_TIMESTAMP not null,
    user_id             integer,
    role                text,
    scope               text
);

alter table jwt_site_scopes
    owner to madoc;

create unique index jwt_site_scopes_uindex
    on jwt_site_scopes (id);

