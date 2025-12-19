create table api_key (
    id serial not null
        constraint api_key_pk
            primary key,
    label text not null,
    client_id text not null unique,
    client_secret text not null,
    user_id integer,
    user_name text,
    site_id integer,
    scope text[],
    password_attempts integer,
    created_at timestamp default CURRENT_TIMESTAMP not null,
    last_used timestamp
);

create unique index api_key_uindex
    on api_key (id);
