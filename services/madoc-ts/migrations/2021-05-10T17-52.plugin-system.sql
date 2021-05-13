--plugin-system (up)
create table plugin
(
    plugin_id uuid not null,
    name text not null,
    description text,
    repository text not null,
    repository_owner text not null,
    version text not null,
    thumbnail text,
    installed boolean not null
);

create unique index plugin_plugin_id_uindex
    on plugin (plugin_id);

alter table plugin
    add constraint plugin_pk
        primary key (plugin_id);

create table plugin_site
(
    plugin_id uuid
        constraint plugin_site_plugin_plugin_id_fk
            references plugin
            on delete cascade not null,
    site_id int not null,
    enabled boolean,
    dev_mode boolean not null,
    dev_revision text
);

create unique index plugin_site_uindex
    on plugin_site (plugin_id, site_id);

create table plugin_token
(
    id uuid not null,
    name text not null,
    token_hash text not null,
    expires_in int not null,
    created_at  timestamp default CURRENT_TIMESTAMP not null,
    revoked boolean not null,
    dev_token boolean not null,
    user_id int not null,
    last_used timestamp,
    scope text[],
    plugin_id uuid
        constraint plugin_tokens_plugin_plugin_id_fk
            references plugin
            on delete cascade not null,
    site_id int not null
);
