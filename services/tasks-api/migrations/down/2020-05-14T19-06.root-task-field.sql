--root-task-field (down)
alter table tasks drop constraint tasks_tasks_id_fk_2;

drop index if exists tasks_root_task_index;

alter table tasks drop column root_task;
