create table tasks
(
    id                  uuid                                not null
        constraint tasks_pk
            primary key,
    name                text                                not null,
    description         text,
    type                text,
    subject             text,
    status              integer,
    status_text         text,
    state               jsonb,
    created_at          timestamp default CURRENT_TIMESTAMP not null,
    parent_task         uuid
        constraint tasks_tasks_id_fk
            references tasks,
    parameters          jsonb,
    creator_id          text,
    creator_name        text,
    assignee_id         text,
    assignee_is_service boolean,
    assignee_name       text,
    context             jsonb                               not null
);

alter table tasks
    owner to current_user;

create unique index tasks_id_uindex
    on tasks (id);

