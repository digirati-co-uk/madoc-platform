--further-index (up)
create index tasks_created_at_index
    on tasks (created_at);

create index tasks_context_index
    on tasks (context);
