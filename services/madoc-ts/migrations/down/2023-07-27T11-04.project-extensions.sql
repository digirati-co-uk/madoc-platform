--project-extensions (down)


alter table iiif_derived_resource drop column if exists placeholder_image;
alter table iiif_resource drop column if exists placeholder_image;

alter table iiif_project drop column if exists due_date;
alter table iiif_project drop column if exists start_date;
alter table iiif_project drop column if exists members_only;

drop table if exists project_feedback;
drop table if exists project_updates;
drop table if exists project_members;
