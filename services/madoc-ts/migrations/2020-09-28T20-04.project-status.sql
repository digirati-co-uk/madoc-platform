--project-status (up)
alter table iiif_project
    add status int default 0;
