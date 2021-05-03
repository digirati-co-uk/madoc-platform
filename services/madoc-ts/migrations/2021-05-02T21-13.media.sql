--media (up)
create table media
(
    id                  uuid                                not null
        constraint media_pk
            primary key,
    site_id      int                                 not null,
    file_name    text                                not null,
    display_name text                                not null,
    group_name   text,
    group_order  int,
    hashtags     text[],
    thumbnails   jsonb,
    size         int                                 not null,
    ingester     text                                not null,
    renderer     text                                not null,
    source       text                                not null,
    extension    text                                not null,
    external     boolean                             not null,
    frozen       boolean   default false,
    created      timestamp default CURRENT_TIMESTAMP not null,
    modified     timestamp default CURRENT_TIMESTAMP,
    author_id    text                                not null,
    author_name  text                                not null,
    metadata jsonb
);
