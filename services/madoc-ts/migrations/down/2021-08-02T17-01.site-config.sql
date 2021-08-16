--site-config (down)
alter table site drop column config;
alter table user_invitations drop column config;
drop table if exists system_config;
