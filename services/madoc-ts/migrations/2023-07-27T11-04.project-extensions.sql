--project-extensions (up)

alter table iiif_derived_resource add column placeholder_image text default null;
alter table iiif_resource add column placeholder_image text default null;

alter table iiif_project add column due_date date default null;
alter table iiif_project add column start_date date default null;
alter table iiif_project add column members_only bool default false;

alter table project_notes add column created timestamp not null default now();
alter table project_notes add column updated timestamp not null default now();

create table project_feedback (
  id serial primary key,
  project_id integer not null references iiif_project(id) on delete cascade,
  user_id integer not null references "user"(id),
  created timestamp not null default now(),
  feedback text not null
);

create table project_updates (
  id serial primary key,
  project_id integer not null references iiif_project(id) on delete cascade,
  user_id integer not null references "user"(id),
  created timestamp not null default now(),
  update text not null,
  snapshot json
);

create table project_members (
  id serial primary key,
  project_id integer not null references iiif_project(id) on delete cascade,
  user_id integer not null references "user"(id),
  created timestamp not null default now(),
  role text,
  role_label text,
  role_color text
);
