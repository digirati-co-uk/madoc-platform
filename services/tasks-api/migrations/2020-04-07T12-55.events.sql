--events (up)
alter table tasks
    add column if not exists events text[];

alter table tasks
    add column if not exists  queue_id text;
