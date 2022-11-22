--user-bot (down)
alter table "user" drop column config;
alter table "user" drop column automated;
alter table "user" drop column created_by;
