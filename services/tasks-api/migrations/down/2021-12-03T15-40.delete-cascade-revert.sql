--delete-cascade-revert (up)
alter table tasks drop constraint tasks_tasks_id_fk;
alter table tasks drop constraint tasks_delegate_task_id_fk;

alter table tasks
    add constraint tasks_tasks_id_fk
        foreign key (parent_task) references tasks
            on delete cascade;

alter table tasks
    add constraint tasks_delegate_task_id_fk
        foreign key (delegated_task) references tasks
            on delete cascade;
