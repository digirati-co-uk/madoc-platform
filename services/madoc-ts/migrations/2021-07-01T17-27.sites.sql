--sites (up)

-- Migrated tables:
-- - site
-- - site_permission
-- - user
-- - user_invitations
-- - password_creation

create table "user"
(
    id serial not null
        constraint user_pk
            primary key,
    email text not null,
    name text not null,
    created timestamp default CURRENT_TIMESTAMP,
    modified timestamp,
    password_hash text, -- This can be null, but user should not be able to login
    role text not null,
    is_active boolean default false
);

create table site
(
    id serial not null
        constraint site_pk
            primary key,
    owner_id integer
        constraint site_owner_id_user_fk
            references "user"
            on update cascade on delete set null,
    title text not null,
    slug text,
    created timestamp default CURRENT_TIMESTAMP,
    modified timestamp,
    is_public boolean default false not null,
    summary text
);

create unique index site_slug_uindex
    on site (slug);

create index site_owner_id
    on site (owner_id);

create unique index user_email_uindex
    on "user" (email);


create table site_permission
(
    site_id int not null constraint site_permission_site_id_site_fk
        references site
        on update cascade on delete cascade,
    user_id int not null
        constraint site_permission_user_id_user_fk
            references "user"
            on update cascade on delete cascade,
    role text not null,
    constraint site_permission_pk
        primary key (user_id, site_id)
);

