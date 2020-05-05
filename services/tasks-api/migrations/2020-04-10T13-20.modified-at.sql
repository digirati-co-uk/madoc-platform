--modified-at (up)
alter table tasks
    add column if not exists modified_at timestamp default CURRENT_TIMESTAMP;
