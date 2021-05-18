--personal-notes (up)
create table project_notes
(
    type text,
    note text,
    project_id int not null
        constraint project_notes_iiif_project_id_fk
            references iiif_project
            on delete cascade,
    user_id int not null,
    resource_id int not null
        constraint project_notes_iiif_resource_id_fk
            references iiif_resource
            on delete cascade,
    site_id int not null,
    id uuid not null
        constraint project_notes_pk
            primary key
);

create index project_notes_type_user_id_project_id_site_id_index
    on project_notes (type, user_id, project_id, site_id);

