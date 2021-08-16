--site-config (up)
alter table site
    add config json;

alter table user_invitations
    add config json;

create table system_config
(
    key text not null,
    value json not null
);

create unique index system_config_key_uindex
    on system_config (key);

alter table system_config
    add constraint system_config_pk
        primary key (key);

