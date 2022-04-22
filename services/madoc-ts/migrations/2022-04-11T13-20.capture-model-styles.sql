--capture-model-styles (up)

-- ID
-- Name
-- Date
-- Theme data (JSON)
-- Site id
-- Creator
-- Project -> This table

create table annotation_styles
(
    id         serial
        constraint annotation_styles_pk
            primary key,
    name       text,
    created_at date default current_date,
    data       json,
    site_id    int
        constraint annotation_styles_site_id_fk
            references site
            on delete cascade,
    creator    int
        constraint annotation_styles_user_id_fk
            references "user"
            on delete cascade
);

create unique index annotation_styles_id_uindex
    on annotation_styles (id);


alter table iiif_project
    add style_id int
        constraint iiif_project_annotation_styles_id_fk
            references annotation_styles
            on delete set null;
