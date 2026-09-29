--indexes (up)
create index parent_task_idx on tasks (parent_task);
create index creator_id_idx on tasks (creator_id);
create index assignee_id_idx on tasks (assignee_id);
