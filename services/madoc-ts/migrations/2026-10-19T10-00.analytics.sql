-- Aggregate counters only: no visitor identifiers, URLs, or event records.
create table analytics_daily (
  site_id integer not null references site(id) on delete cascade,
  day date not null,
  project_id integer not null default 0,
  page_views bigint not null default 0,
  signed_in_views bigint not null default 0,
  contributions_started bigint not null default 0,
  contributions_completed bigint not null default 0,
  reviews_completed bigint not null default 0,
  primary key (site_id, day, project_id)
);
create index analytics_daily_day on analytics_daily(day);
create table analytics_settings (
  singleton boolean primary key default true check (singleton),
  started_on date not null default (current_timestamp at time zone 'UTC')::date
);
insert into analytics_settings(singleton) values (true);

-- Deduplication flags live on the existing contribution, not in an analytics event log.
-- Existing work is not backfilled or assigned an invented historical completion date.
alter table capture_model_revision add column analytics_flags smallint not null default 0;
update capture_model_revision set analytics_flags = case
  when status in ('accepted', 'rejected') then 7
  when status = 'submitted' then 3
  else 1 end;
