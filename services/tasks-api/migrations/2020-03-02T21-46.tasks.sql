create table tasks
(
    id            uuid                      not null
        constraint tasks_pk
            primary key,
    name          text                      not null,
    description   text,
    type          text,
    subject       text,
    status        integer,
    state         jsonb,
    created_at    timestamp default CURRENT_TIMESTAMP not null,
    parent_task   uuid
        constraint tasks_tasks_id_fk
            references tasks,
    parameters    jsonb,
    creator_id    text,
    creator_name  text,
    assignee_id   text,
    assignee_name text,
    status_text   text
);

alter table tasks
    owner to tasks_api;

create unique index tasks_id_uindex
    on tasks (id);

