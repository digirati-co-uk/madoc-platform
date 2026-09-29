--root-task-cascade (up)
alter table tasks drop constraint tasks_tasks_id_fk_2;

alter table tasks
    add constraint tasks_tasks_id_fk_2
        foreign key (root_task) references tasks
            on delete set null;
