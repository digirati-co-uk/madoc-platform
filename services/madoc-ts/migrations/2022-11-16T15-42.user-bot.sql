--user-bot (up)
alter table "user"
    add config jsonb;

alter table "user"
    add automated boolean default false;

alter table "user"
    add created_by int default null;
