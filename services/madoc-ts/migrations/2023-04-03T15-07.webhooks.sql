--webhooks (up)
create table webhook
(
    id            uuid    not null
        constraint webhooks_pk
            primary key,
    event_id      text    not null,
    url           text    not null,
    site_id       integer not null,
    scope         text[],
    creator       integer,
    created_at    timestamp default CURRENT_TIMESTAMP,
    body_template text
);

create table webhook_call
(
    id          uuid,
    time        timestamp default CURRENT_TIMESTAMP,
    is_outgoing bool,
    status_code integer,
    site_id     integer,
    webhook_id  uuid
        constraint webhook_call_webhooks_id_fk
            references webhook
            on delete cascade,
    request     text,
    response    text,
    static_id   text,
    call_id     text,
    event_id    text,
    success     bool
);

create index webhooks_site_id_index
    on webhook (site_id);
