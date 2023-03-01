--manifest-thumbnail (up)
create or replace function manifest_thumbnail(
    sid int, manifest_id int
) returns text as
$$
declare
    return_value text;
begin

    -- First check if there is a `default_thumbnail` on the IIIF resource itself
    select default_thumbnail
    from iiif_resource
             left join iiif_derived_resource_items ird on iiif_resource.id = ird.item_id
    where id = manifest_id
    and ird.site_id = sid
    into return_value;

    if return_value is not null then
        return return_value;
    end if;


    -- Otherwise get the default thumbnail from the first available canvas.
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


