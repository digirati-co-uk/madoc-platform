--user-extensions (down)

drop table if exists badge_award;
drop table if exists badge;
drop table if exists site_terms;
alter table "user" drop column terms_accepted;
alter table "user" drop column user_preferences;
alter table "user" drop column user_info;
