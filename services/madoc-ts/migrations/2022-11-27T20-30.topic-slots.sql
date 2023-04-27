--topic-slots (up)
alter table "site_slots"
    add filter_topic_type_none boolean default true,
    add filter_topic_type_all boolean default false,
    add filter_topic_type_exact text,
    add filter_topic_type_whitelist text[],
    add filter_topic_type_blacklist text[],

    add filter_topic_none boolean default true,
    add filter_topic_all boolean default false,
    add filter_topic_exact text,
    add filter_topic_whitelist text[],
    add filter_topic_blacklist text[]
;
