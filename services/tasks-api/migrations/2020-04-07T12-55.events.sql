--events (up)
alter table tasks
    add column if not exists events text[];
