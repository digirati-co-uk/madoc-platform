--capture-model-database (up)

-- capture_model_document
create table capture_model_document
(
    id             uuid not null
        constraint capture_model_document_pk
            primary key,
    document_data  jsonb not null default '{}'::jsonb,
    target         jsonb,
    search_strings text not null default '',
    site_id        int  not null,
    created_at     timestamp     default CURRENT_TIMESTAMP not null,
    updated_at     timestamp     default CURRENT_TIMESTAMP not null
);

-- capture_model_structure
create table capture_model_structure
(
    id              uuid not null
        constraint capture_model_structure_pk
            primary key,
    structure_data  json not null default '{}'::json,
    structure_label text not null default ''::text,
    site_id         int  not null,
    created_at      timestamp     default CURRENT_TIMESTAMP not null,
    updated_at      timestamp     default CURRENT_TIMESTAMP not null
);

-- capture_model
create table capture_model
(
    id           uuid                                not null
        constraint capture_model_pk
            primary key,
    derived_from uuid, -- This is not enforced.
    profile      text,
    target       jsonb,
    integrity    jsonb,
    site_id      int                                 not null,
    created_at   timestamp default CURRENT_TIMESTAMP not null,
    updated_at   timestamp default CURRENT_TIMESTAMP not null,
    document_id  uuid
        constraint capture_model_document_fk
            references capture_model_document
            on delete set null,
    structure_id uuid
        constraint capture_model_structure_fk
            references capture_model_structure
            on delete set null
);

-- capture_model_revision
create table capture_model_revision
(
    id               uuid not null
        constraint capture_model_revision_pk
            primary key,
    -- All revisions to a document will be deleted when a document is deleted.
    document_id      uuid
        constraint capture_model_revision_document_fk
            references capture_model_document
            on delete cascade,
    -- All revisions will be deleted when a capture model is deleted.
    -- Optionally revisions could be copied over to a new model.
    capture_model_id uuid
        constraint capture_model_revision_model_fk
            references capture_model
            on delete cascade,
    revision_label   text,
    -- This could be an enum.
    author_id        int,
    status           text not null default 'draft'::text,
    approved         bool not null default false,
    revises          uuid,
    deleted_fields   json not null default '[]'::json,
    revision_data    json not null default '{}'::json,
    site_id          int  not null,
    created_at       timestamp     default CURRENT_TIMESTAMP not null,
    updated_at       timestamp     default CURRENT_TIMESTAMP not null
);


create index capture_model_structure_id
    on capture_model (structure_id);

create index capture_model_document_id
    on capture_model (document_id);

create index capture_model_revision_capture_model_id
    on capture_model_revision (capture_model_id);

create index capture_model_revision_document_id
    on capture_model_revision (document_id);
