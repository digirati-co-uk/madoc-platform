-- Adds support for storing annotations

CREATE OR REPLACE FUNCTION create_annotation(
    annotation json,
    sid int,
    added_by int
)
    RETURNS table
            (
                canonical_id int
            )
AS
$id$
declare
    -- Technical
    annotation_id                text;

    -- Returns
    canonical_id             int;

begin
    -- Grab the source ID
    annotation_id = (annotation ->> 'id')::text;
    -- iiif_resource.source

    -- Check for existing canvas resource
    select id from iiif_resource where source = annotation_id into canonical_id;

    -- We need to add it.
    if canonical_id is null then
        insert into iiif_resource (type, source, local_source, rights, height, width,
                                   duration, default_thumbnail)
        select 'annotation'                              as type,
               (annotation ->> 'id')::text               as source,
               null                          as local_source,
               (annotation ->> 'rights')::text           as rights,
               (annotation ->> 'height')::int            as height,
               (annotation ->> 'width')::int             as width,
               (annotation ->> 'duration')::text::float8 as duration,
               null                             as default_thumbnail
        on conflict do nothing
            -- Populate canonical id with our new resource.
        returning id into canonical_id;

        if canonical_id is null then
            select id from iiif_resource where source = annotation_id into canonical_id;
        end if;
    end if;


    return query select canonical_id;
end;
$id$ language plpgsql;

create or replace function add_canvas_annotations(
    canvas_id int,
    annotation_ids int[],
    sid int
) returns boolean as
$$
declare
    item_ids_json  json;
    single_item_id int;
begin

    -- Purpose: GLOBALLY add manifest to collection
    item_ids_json = to_json(annotation_ids);

    for key in 0..(array_length(annotation_ids, 1) - 1)
        loop
            single_item_id = item_ids_json -> key;
            insert into iiif_resource_items (resource_id, item_id, item_index)
            values (canvas_id, single_item_id, key)
            on conflict (resource_id, item_id) do update set item_index = key;
        end loop;

    return true;
end
$$ language plpgsql;
