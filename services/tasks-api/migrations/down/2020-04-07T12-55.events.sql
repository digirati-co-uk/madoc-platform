--events (down)
alter table tasks drop column events;

alter table tasks drop column queue_id;
