--notifications (up)
create table notifications
(
    id uuid not null,
    title text not null,
    summary text,
    created_at timestamp default CURRENT_TIMESTAMP,
    read_at timestamp,
    site_id int not null,
    user_id int not null,
    action_id text not null,
    action_link text,
    action_text text,
    from_user_id int,
    from_user_name text,
    tags text[]
);

create unique index notifications_id_uindex
    on notifications (id);

create index notifications_site_id_user_id_created_at_index
    on notifications (site_id asc, user_id asc, created_at desc);

alter table notifications
    add constraint notifications_pk
        primary key (id);

