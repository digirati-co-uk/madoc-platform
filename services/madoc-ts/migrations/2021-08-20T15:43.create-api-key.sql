create table api_key (
    id serial not null
        constraint api_key_pk
            primary key,
    label text not null,
    client_id text not null unique,
    client_secret text not null,
    user_id integer,
    user_name text,
    password_attempts integer
);

create table api_key_scope (
    id serial not null
        constraint api_key_scope_pk
            primary key,
    key_id integer,
    scope text not null,
    constraint api_key_fk
        foreign key (key_id)
            references api_key(id)
);

alter table api_key
    owner to current_user;

alter table api_key_scope
    owner to current_user;

create unique index api_key_uindex
    on api_key (id);

create unique index api_key_scope_uindex
    on api_key_scope (id);
