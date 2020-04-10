--delete-cascade (up)
alter table tasks drop constraint tasks_tasks_id_fk;

alter table tasks
    add constraint tasks_tasks_id_fk
        foreign key (parent_task) references tasks
            on delete cascade;
