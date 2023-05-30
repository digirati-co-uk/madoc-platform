--topic-slots (down)

alter table "site_slots" drop column filter_topic_type_none;
alter table "site_slots" drop column filter_topic_type_all;
alter table "site_slots" drop column filter_topic_type_exact;
alter table "site_slots" drop column filter_topic_type_whitelist;
alter table "site_slots" drop column filter_topic_type_blacklist;

alter table "site_slots" drop column filter_topic_none;
alter table "site_slots" drop column filter_topic_all;
alter table "site_slots" drop column filter_topic_exact;
alter table "site_slots" drop column filter_topic_whitelist;
alter table "site_slots" drop column filter_topic_blacklist;
