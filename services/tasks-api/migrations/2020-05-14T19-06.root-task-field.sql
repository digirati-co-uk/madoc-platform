--root-task-field (up)
alter table tasks
    add root_task uuid;

create index tasks_root_task_index
    on tasks (root_task);

alter table tasks
    add constraint tasks_tasks_id_fk_2
        foreign key (root_task) references tasks;
