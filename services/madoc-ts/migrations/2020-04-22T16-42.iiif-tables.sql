--iiif-tables (up)

--
-- Tables
--

create table iiif_resource
(
    id                serial not null
        constraint iiif_resource_pk
            primary key,
    type              text   not null,
    source            text,
    local_source      text,
    rights            text,
    viewing_direction integer default 0,
    nav_date          timestamp,
    height            integer,
    width             integer,
    duration          double precision,
    default_thumbnail text
);

alter table iiif_resource
    owner to current_user;

create unique index iiif_resource_source_uindex
    on iiif_resource (source);

create table iiif_metadata
(
    id          serial                        not null
        constraint iiif_metadata_pk
            unique,
    key         text                          not null,
    value       text,
    language    text    default '@none'::text not null,
    source      text                          not null,
    resource_id integer                       not null
        constraint iiif_metadata_iiif_resource_id_fk
            references iiif_resource
            on update cascade on delete cascade,
    site_id     integer,
    readonly    boolean default false,
    edited      boolean default false,
    auto_update boolean default true,
    data        jsonb,
    constraint iiif_metadata_pk_2
        unique (key, value, language, source, resource_id, site_id)
);

alter table iiif_metadata
    owner to current_user;

create index iiif_metadata_resource_id_index
    on iiif_metadata (resource_id, site_id);

create index iiif_metadata_structure_id_index
    on iiif_metadata (site_id);

create unique index iiif_metadata_uq
    on iiif_metadata (key, COALESCE(value, ''::text), language, source, resource_id, COALESCE(site_id, '-1'::integer));

create index iiif_metadata_labels_index
    on iiif_metadata (id, resource_id, site_id) where key = 'label';

create table iiif_resource_items
(
    resource_id integer           not null
        constraint iiif_resource_items_iiif_resource_id_fk
            references iiif_resource
            on update cascade on delete cascade,
    item_id     integer           not null
        constraint iiif_resource_items_iiif_item_id_fk
            references iiif_resource
            on update cascade on delete cascade,
    item_index  integer default 0 not null,
    constraint iiif_resource_items_pk
        primary key (resource_id, item_id)
);

alter table iiif_resource_items
    owner to current_user;

create table iiif_derived_resource
(
    id            serial                              not null
        constraint iiif_derived_resource_pk
            primary key,
    site_id       integer                             not null,
    resource_type text                                not null,
    resource_id   integer                             not null
        constraint iiif_derived_resource_iiif_resource_id_fk
            references iiif_resource
            on update cascade on delete cascade,
    created_at    timestamp default CURRENT_TIMESTAMP not null,
    created_by    text,
    slug          text,
    task_id       text,
    task_complete boolean   default false,
    flat          boolean   default false             not null
);

alter table iiif_derived_resource
    owner to current_user;

create index iiif_derived_resource_site_id_index
    on iiif_derived_resource (site_id);

create unique index iiif_derived_resource_slug_index
    on iiif_derived_resource (site_id, slug);

create index iiif_derived_resource_type_index
    on iiif_derived_resource (resource_type);

create unique index iiif_derived_resource_resource_id_site_id_uindex
    on iiif_derived_resource (resource_id, site_id);

create table iiif_derived_resource_items
(
    resource_id integer not null
        constraint iiif_derived_resource_items_iiif_resource_id_fk
            references iiif_resource
            on update cascade on delete cascade,
    item_id     integer not null
        constraint iiif_derived_resource_items_iiif_item_id_fk
            references iiif_resource
            on update cascade on delete cascade,
    item_index  integer default 0,
    site_id     integer not null,
    constraint iiif_derived_resource_items_pk
        primary key (resource_id, item_id, site_id)
);

alter table iiif_derived_resource_items
    owner to current_user;

create index iiif_derived_resource_items_item_id_index
    on iiif_derived_resource_items (item_id);

create index iiif_derived_resource_items_resource_id_index
    on iiif_derived_resource_items (resource_id);

create index iiif_derived_resource_items_preview
    on iiif_derived_resource_items (resource_id, item_id, item_index)
    where (item_index < 5);

create table iiif_project
(
    id               serial  not null
        constraint iiif_project_pk
            primary key,
    task_id          uuid    not null,
    collection_id    integer not null
        constraint iiif_project_iiif_resource_id_fk
            references iiif_resource,
    slug             text    not null,
    site_id          integer not null,
    capture_model_id uuid    not null
);

alter table iiif_project
    owner to current_user;

create unique index iiif_project_site_id_slug_uindex
    on iiif_project (site_id, slug);

--
-- Views
--

CREATE VIEW iiif_derived_resource_item_counts (resource_id, site_id, item_total) as
SELECT resource_id, site_id, COUNT(DISTINCT item_id)
FROM iiif_derived_resource_items
GROUP BY (resource_id, site_id);

--
-- Functions
--

create or replace function add_single_metadata(
    term text,
    language_map json,
    input_source text,
    rid int,
    sid int
) returns boolean as
$$
declare
    language_value RECORD;
    text_value     RECORD;
begin
    for language_value in select t.key, t.value from json_each(language_map) t
        loop
            begin
                for text_value in select json_array_elements_text(
                                                 language_map -> language_value.key) as text
                    loop
                        insert into iiif_metadata (key, value, source, language, resource_id, site_id)
                        VALUES (term, text_value.text, input_source, language_value.key, rid, sid)
                        on conflict do nothing;
                    end loop;
            end;
        end loop;
    return true;
end;
$$
    language plpgsql;

create or replace function add_metadata(
    test json,
    input_source text,
    rid int,
    sid int
) returns boolean as
$id$
declare
    metadata_field RECORD;
begin

    for metadata_field in select t.key, t.value from json_each(test) t
        loop
            perform add_single_metadata(metadata_field.key, metadata_field.value, input_source, rid, sid);
        end loop;

    return true;
end;
$id$
    language plpgsql;

create or replace function add_metadata_key_value_pairs(
    input_metadata json,
    resource_id int,
    site_id int,
    input_source text
) returns bool as
$id$
declare

begin
    for key in 0..(json_array_length(input_metadata) - 1)
        loop
        -- Save the metadata fields as metadata.0.label and metadata.0.value
        -- This is a special case in the de-serialisation, not ideal.
            perform add_single_metadata('metadata.' || (key)::text || '.label',
                                        input_metadata -> key -> 'label', input_source, resource_id, site_id);
            perform add_single_metadata('metadata.' || (key)::text || '.value',
                                        input_metadata -> key -> 'value', input_source, resource_id, site_id);
        end loop;

    return true;
end;
$id$ language plpgsql;

create or replace function create_canvas(
    canvas json,
    local_source text,
    thumbnail text,
    sid int,
    added_by text
)
    returns table
            (
                derived_id   int,
                canonical_id int
            )
as
$id$
declare
    -- Technical
    canvas_id                text;

    -- Descriptive.
    input_label              json;
    input_summary            json;
    input_metadata           json;
    input_required_statement json;

    -- Returns
    derived_id               int;
    canonical_id             int;

begin
    -- Grab the source ID
    canvas_id = (canvas ->> 'id')::text;
    -- iiif_resource.source

    -- Check for existing canvas resource
    select id from iiif_resource where source = canvas_id into canonical_id;

    -- We need to add it.
    if canonical_id is null then
        -- Descriptive
        select canvas -> 'label' into input_label; -- iiif_metadata
        select canvas -> 'summary' into input_summary; -- iiif_metadata
        select canvas -> 'metadata' into input_metadata; -- iiif_metadata (label + value)
        select canvas -> 'requiredStatement' into input_required_statement; -- iiif_metadata (label + value)

        if input_label is null then
            raise exception 'Canvas label is required, %', canvas_id;
        end if;

        insert into iiif_resource (type, source, local_source, rights, height, width,
                                   duration, default_thumbnail)
        select 'canvas'                              as type,
               (canvas ->> 'id')::text               as source,
               local_source                          as local_source,
               (canvas ->> 'rights')::text           as rights,
               -- canvas -> 'navDate'  as nav_date, -- dates..
               (canvas ->> 'height')::int            as height,
               (canvas ->> 'width')::int             as width,
               (canvas ->> 'duration')::text::float8 as duration,
               thumbnail                             as default_thumbnail
        on conflict do nothing
            -- Populate canonical id with our new resource.
        returning id into canonical_id;

        if canonical_id is null then
            select id from iiif_resource where source = canvas_id into canonical_id;
        end if;

        if input_label is not null then
            perform add_single_metadata('label', input_label, 'iiif', canonical_id, null);
        end if;

        if input_summary is not null then
            perform add_single_metadata('summary', input_summary, 'iiif', canonical_id, null);
        end if;

        if input_metadata is not null then
            perform add_metadata_key_value_pairs(input_metadata, canonical_id, null, 'iiif');
        end if;

        if input_required_statement is not null then
            perform add_single_metadata('requiredStatement.label', input_required_statement -> 'label', 'iiif',
                                        canonical_id, null);
            perform add_single_metadata('requiredStatement.value', input_required_statement -> 'value', 'iiif',
                                        canonical_id, null);
        end if;

    end if;

    if sid is not null then
        -- Derive Canvas.
        derived_id = derive_resource(canonical_id, sid, added_by, null);
    end if;

    return query select derived_id, canonical_id;
end;
$id$ language plpgsql;

create or replace function create_manifest(
    manifest json,
    local_source text,
    sid int,
    added_by text,
    task_id text
)
    returns table
            (
                derived_id   int,
                canonical_id int
            )
as
$id$
declare
    manifest_id              text;
    input_label              json;
    input_summary            json;
    input_metadata           json;
    input_required_statement json;
    input_viewing_direction  text;
    viewing_direction        int;
    -- return
    canonical_id             int;
    derived_id               int;
begin
    -- Grab the source ID
    manifest_id = (manifest ->> 'id')::text;
    -- iiif_resource.source

    -- Check for existing canvas resource
    select id from iiif_resource where source = manifest_id into canonical_id;

    -- We need to add it.
    if canonical_id is null then
        -- Descriptive
        input_label = manifest -> 'label'; -- iiif_metadata
        input_summary = manifest -> 'summary'; -- iiif_metadata
        input_metadata = manifest -> 'metadata'; -- iiif_metadata (label + value)
        input_required_statement = manifest -> 'requiredStatement'; -- iiif_metadata (label + value)
        input_viewing_direction = manifest ->> 'viewingDirection';


        case
            when input_viewing_direction = 'left-to-right' then viewing_direction = 0;
            when input_viewing_direction = 'right-to-left' then viewing_direction = 1;
            when input_viewing_direction = 'top-to-bottom' then viewing_direction = 2;
            when input_viewing_direction = 'bottom-to-top' then viewing_direction = 3;
            else viewing_direction = 0;
            end case;

        insert into iiif_resource (type, source, local_source, rights, viewing_direction)
        select 'manifest'                    as type,
               (manifest ->> 'id')::text     as source,
               local_source                  as local_source,
               (manifest ->> 'rights')::text as rights,
               viewing_direction             as viewing_direction
               -- Populate canonical id with our new resource.
        returning id into canonical_id;

        if input_label is not null then
            perform add_single_metadata('label', input_label, 'iiif', canonical_id, null);
        end if;

        if input_summary is not null then
            perform add_single_metadata('summary', input_summary, 'iiif', canonical_id, null);
        end if;

        if input_metadata is not null then
            perform add_metadata_key_value_pairs(input_metadata, canonical_id, null, 'iiif');
        end if;

        if input_required_statement is not null then
            perform add_single_metadata('requiredStatement.label', input_required_statement -> 'label', 'iiif',
                                        canonical_id, null);
            perform add_single_metadata('requiredStatement.value', input_required_statement -> 'value', 'iiif',
                                        canonical_id, null);
        end if;

    end if;

    if sid is not null then
        -- Derive manifest.
        derived_id = derive_resource(canonical_id, sid, added_by, task_id);
    end if;

    return query select derived_id, canonical_id;
end;
$id$ language plpgsql;

create or replace function create_collection(
    collection json,
    sid int,
    added_by text,
    task_id text
)
    returns table
            (
                derived_id   int,
                canonical_id int
            )
as
$id$
declare
    collection_id  text;
    input_label    json;
    input_summary  json;
    input_metadata json;
    -- return
    canonical_id   int;
    derived_id     int;
begin
    -- Grab the source ID
    collection_id = (collection ->> 'id')::text;
    -- iiif_resource.source

    -- Check for existing canvas resource
    select id from iiif_resource where source = collection_id into canonical_id;

    if canonical_id is null then
        -- Descriptive
        input_label = collection -> 'label'; -- iiif_metadata
        input_summary = collection -> 'summary'; -- iiif_metadata
        input_metadata = collection -> 'metadata'; -- iiif_metadata (label + value)

        insert into iiif_resource (type, source)
        select 'collection'                as type,
               (collection ->> 'id')::text as source
               -- Populate canonical id with our new resource.
        returning id into canonical_id;

        if input_label is not null then
            perform add_single_metadata('label', input_label, 'iiif', canonical_id, null);
        end if;

        if input_summary is not null then
            perform add_single_metadata('summary', input_summary, 'iiif', canonical_id, null);
        end if;

        if input_metadata is not null then
            perform add_metadata_key_value_pairs(input_metadata, canonical_id, null, 'iiif');
        end if;
    end if;

    if sid is not null then
        -- Derive Collection.
        derived_id = derive_resource(canonical_id, sid, added_by, task_id);
    end if;

    return query select derived_id, canonical_id;
end
$id$ language plpgsql;

create or replace function update_metadata_field(
    input_resource_id int,
    input_key text,
    input_language text,
    input_source text,
    input_value text,
    sid int
) returns boolean as
$$
declare
begin

    if sid is not null then
        -- Update both the canonical AND any site ones that match
        update iiif_metadata im
        set value       = input_value,
            edited      = true,
            readonly    = false,
            auto_update = false
        where im.resource_id = input_resource_id
          and im.site_id = sid
          and im.key = input_key
          and im.source = input_source
          and im.language = input_language;

        return true;
    end if;


    update iiif_metadata im
    set value = input_value
    where im.resource_id = input_resource_id
      and im.key = input_key
      and im.source = input_source
      and im.language = input_language
      and (
            (im.site_id is null) or (
            im.auto_update = true and im.edited = false
            )
        );

    return true;
end
$$ language plpgsql;

create or replace function derive_resource(
    canonical_resource_id int,
    sid int,
    added_by text,
    tid text
) returns int as
$id$
declare
    canonical_resource_type text;
    derived_resource_id     int;
    sub_resource            record;
begin
    select type from iiif_resource where id = canonical_resource_id into canonical_resource_type;

    select id
    from iiif_derived_resource
    where resource_type = canonical_resource_type
      and resource_id = canonical_resource_id
      and site_id = sid
    into derived_resource_id;

    if derived_resource_id is null then
        insert into iiif_derived_resource (resource_type, resource_id, created_by, site_id, task_id)
        values (canonical_resource_type, canonical_resource_id, added_by, sid, tid)
        returning id into derived_resource_id;

        -- Now, say we've derived a collection
        -- We need to derive each manifest, and each canvas
        for sub_resource in select item_id
                            from iiif_resource_items
                            where resource_id = canonical_resource_id
            loop
                begin
                    perform derive_resource(sub_resource.item_id, sid, added_by, tid);
                end;
            end loop;


        -- We also need to add the results of this into iiif_derived_resource_items
        insert into iiif_derived_resource_items (resource_id, item_id, item_index, site_id)
        select canonical_resource_id as resource_id,
               iri.item_id           as item_id,
               iri.item_index        as item_index,
               sid                   as site_id
        from iiif_resource_items iri
        where iri.resource_id = canonical_resource_id
        on conflict do nothing;
    end if;

    raise notice 'Derived resource id %', derived_resource_id;

    -- Only insert one level, we've got the recursive call to derive_resource
    insert into iiif_metadata (key, value, source, language, resource_id, site_id)
    select im.key,
           im.value,
           im.source,
           im.language,
           im.resource_id,
           sid as structure_id
    from iiif_metadata im
    where im.resource_id = canonical_resource_id
    on conflict do nothing;

    return derived_resource_id;
end ;
$id$
    language plpgsql;

create or replace function add_item_context(
    sid int,
    rid int,
    item_ids int[]
) returns boolean as
$$
declare
    item_ids_json  json;
    single_item_id int;
begin

    -- Purpose: GLOBALLY add manifest to collection
    item_ids_json = to_json(item_ids);

    for key in 0..(array_length(item_ids, 1) - 1)
        loop
            single_item_id = item_ids_json -> key;
            insert into iiif_derived_resource_items (resource_id, item_id, item_index, site_id)
            values (rid, single_item_id, key, sid)
            on conflict (resource_id, item_id, site_id) do update set item_index = key;
        end loop;

    return true;
end
$$ language plpgsql;

create or replace function remove_item_context(
    sid int,
    rid int,
    to_remove_id int
) returns boolean as
$$
declare
begin

    delete
    from iiif_derived_resource_items ir
    where site_id = sid
      and ir.item_id = to_remove_id
      and ir.resource_id = rid;

    return true;
end
$$ language plpgsql;

create or replace function add_sub_resources(
    site_id int,
    parent_resource_id int,
    item_ids int[],
    added_by text
) returns boolean as
$$
declare
    item_ids_json json;
    canvas_id     int;
begin

    item_ids_json = to_json(item_ids);

    for key in 0..(array_length(item_ids, 1) - 1)
        loop
            canvas_id = item_ids_json -> key;
            insert into iiif_resource_items (item_id, resource_id, item_index)
            select canvas_id          as item_id,
                   parent_resource_id as resource_id,
                   key                as item_index
            on conflict (resource_id, item_id) do update set item_index = key;
        end loop;

    if site_id is not null then
        -- Make the connection on the site too.
        for key in 0..(array_length(item_ids, 1) - 1)
            loop
                canvas_id = item_ids_json -> key;

                -- Deriving each item, will do nothing if it already exists.
                perform derive_resource(canvas_id, site_id, added_by, null);
            end loop;

        -- Updating context.
        perform add_item_context(
                site_id,
                parent_resource_id,
                item_ids
            );

    end if;

    return true;
end;
$$ language plpgsql;

create or replace function modify_derived_items(
    sid int,
    parent_resource_id int,
    ids int[]
) returns boolean as
$$
declare
begin

    -- Remove old ones.
    delete
    from iiif_derived_resource_items
    where item_id = any (ids) = false
      and site_id = sid
      and resource_id = parent_resource_id;

    -- Update existing ones.
    update iiif_derived_resource_items
    set item_index = array_position(ids, item_id)
    where item_id = ANY (ids)
      and resource_id = parent_resource_id
      and site_id = sid;

    -- Add new ones.
    --   Get list of ids that are NOT in the column
    insert into iiif_derived_resource_items (resource_id, item_id, item_index, site_id)
    select new_id                      as item_id,
           parent_resource_id          as resource_id,
           array_position(ids, new_id) as item_index,
           sid                         as site_id
    from unnest(ids) new_id
    where new_id = any (select id from iiif_derived_resource) = false;

    return true;
end
$$ language plpgsql;

create or replace function manifest_thumbnail(
    sid int, manifest_id int
) returns text as
$$
declare
    return_value text;
begin

    select default_thumbnail
    from iiif_derived_resource_items
             left join iiif_resource ir on iiif_derived_resource_items.item_id = ir.id
    where item_index < 5
      and resource_id = manifest_id
      and default_thumbnail is not null
      and site_id = sid
    limit 1
    into return_value;

    return return_value;
end;
$$ language plpgsql;

create or replace function get_flat_collections(
    input_id int,
    sid int,
    id_stack int[]
) returns int[] as
$$
declare
    item_flat       bool;
    parent_resource record;
    return_ids      int[];
begin
    return_ids = array []::int[];

    if id_stack is null then
        id_stack = array[]::int[];
    end if;

    id_stack = array_append(id_stack, input_id);

    select flat from iiif_derived_resource where resource_id = input_id and site_id = sid into item_flat;

    if item_flat then
        return array [input_id]::int[];
    end if;

    for parent_resource in select ird.resource_id, ir.flat
                           from iiif_derived_resource_items ird
                                    left join iiif_derived_resource ir on ird.resource_id = ir.id
                           where ird.item_id = input_id
                             and ird.site_id = sid
        loop
            if parent_resource.flat then
                raise notice 'found flat resource %', parent_resource.resource_id;
                return_ids = array_append(return_ids, parent_resource.resource_id);
            else
                if parent_resource.resource_id = any(id_stack) then
                    raise notice 'Prevent infinite loop %', parent_resource.resource_id;
                else
                    raise notice 'found parent resource that is not flat %', parent_resource.resource_id;
                    return_ids = array_cat(return_ids, get_flat_collections(parent_resource.resource_id, sid, id_stack));
                end if;
            end if;
        end loop;

    return return_ids;
end;

$$ language plpgsql;

create or replace function unflatten_derived_collection(
    input_id int,
    sid int,
    id_stack int[]
) returns int[] as
$$
declare
    parent_resource record;
    return_ids      int[];
begin
    return_ids = array []::int[];

    if id_stack is null then
        id_stack = array[]::int[];
    end if;

    id_stack = array_append(id_stack, input_id);

    for parent_resource in select ird.item_id, ir.resource_type
                           from iiif_derived_resource_items ird
                                    left join iiif_derived_resource ir on ird.item_id = ir.id
                           where ird.resource_id = input_id
                             and ird.site_id = sid
        loop
            if parent_resource.resource_type = 'manifest' then
                raise notice 'found parent resource that is manifest, pushing... %', parent_resource.item_id;
                return_ids = array_append(return_ids, parent_resource.item_id);
            else
                if parent_resource.resource_type = 'collection' then
                    if parent_resource.item_id = any (id_stack) then
                        raise notice 'Infinite loop prevented.. %', parent_resource.item_id;
                    else
                        raise notice 'found parent resource that is collection, resolving.. %', parent_resource.item_id;
                        return_ids = array_cat(return_ids,
                                               unflatten_derived_collection(parent_resource.item_id, sid, id_stack));
                    end if;
                end if;
            end if;
        end loop;

    return return_ids;
end;

$$ language plpgsql;


create or replace function update_flat_collection_items(
    add_this int,
    to_this int,
    sid int
) returns bool as
$$
declare
    root_collections        int[];
    root_collection         int;
    rtype                   text;
    manifests_already_added int[];
    manifests_to_add        int[];
    manifests_missing       int[];
    manifest                int;
begin
    -- For each of these.
    root_collections = get_flat_collections(to_this, 1, null);

    select resource_type from iiif_derived_resource where resource_id = add_this and site_id = sid into rtype;
    if rtype != 'collection' then
        manifests_to_add = array [add_this]::int[];
    else
        manifests_to_add = unflatten_derived_collection(add_this, 1, null);
    end if;

    foreach root_collection in array root_collections
        loop
            manifests_missing = array []::int[];

            select array_agg(item_id)
            from iiif_derived_resource_items
            where resource_id = root_collection
              and site_id = sid
            group by resource_id
            limit 1
            into manifests_already_added;

            -- Fetch manifests from the root
            -- Append the following if they are not in the array above
            -- start_index = array_length(manifests_already_added, 1);
            foreach manifest in array manifests_to_add
                loop
                    if (manifest = any (manifests_already_added)) = false then
                        manifests_missing = array_append(manifests_missing, manifest);
                    end if;
                end loop;

            if array_length(manifests_missing, 1) > 0 then
                foreach manifest in array manifests_missing
                    loop
                        insert into iiif_derived_resource_items (resource_id, item_id, item_index, site_id)
                        VALUES (root_collection, manifest,
                                array_length(manifests_already_added, 1) + array_position(manifests_missing, manifest),
                                sid)
                        on conflict do nothing;
                    end loop;
            end if;
        end loop;

    return true;
end
$$ language plpgsql;
