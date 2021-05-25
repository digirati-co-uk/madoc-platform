--change-discovery (up)
create table change_discovery_activity
(
    activity_id serial not null,
    activity_type text not null,
    primary_stream text not null,
    secondary_stream text,
    object_id text not null,
    object_type text not null,
    object_canonical_id text not null,
    end_time timestamp default CURRENT_TIMESTAMP,
    start_time timestamp,
    site_id int not null,
    properties json
);

create unique index change_discovery_activity_activity_id_uindex
    on change_discovery_activity (activity_id);

create index change_discovery_activity_sort_index
    on change_discovery_activity (primary_stream, secondary_stream, end_time, site_id);

alter table change_discovery_activity
    add constraint change_discovery_activity_pk
        primary key (activity_id);

