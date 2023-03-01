--manifest-thumbnail (down)
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
