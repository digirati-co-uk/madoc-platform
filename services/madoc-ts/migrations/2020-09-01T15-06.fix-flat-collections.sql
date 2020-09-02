--fix-flat-collections (up)
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
    root_collections = get_flat_collections(to_this, sid, null);

    select resource_type from iiif_derived_resource where resource_id = add_this and site_id = sid into rtype;
    if rtype != 'collection' then
        manifests_to_add = array [add_this]::int[];
    else
        manifests_to_add = unflatten_derived_collection(add_this, sid, null);
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
                                    left join iiif_derived_resource ir on ird.item_id = ir.resource_id
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
                                    left join iiif_derived_resource ir on ird.resource_id = ir.resource_id
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
