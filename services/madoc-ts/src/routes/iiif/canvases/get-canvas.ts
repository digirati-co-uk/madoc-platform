import { sql } from 'slonik';
import { deprecationGetItemsJson } from '../../../deprecations/01-local-source-canvas';
import { optionalUserWithScope } from '../../../utility/user-with-scope';
import { mapMetadata } from '../../../utility/iiif-metadata';
import { RouteMiddleware } from '../../../types/route-middleware';

export const getCanvas: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = optionalUserWithScope(context, []);

  const canvasId = context.params.id;

  const canvas = await context.connection.many<{
    resource_id: number;
    created_at: Date;
    key: string;
    value: string;
    language: string;
    source: string;
    // Canvas specific.
    rights: string | null;
    duration: number | null;
    height: number;
    width: number;
    nav_date: Date | null;
    viewing_direction: number;
    default_thumbnail: string | null;
    local_source: string | null;
    thumbnail_json: any | null;
    items_json: any | null;
  }>(
    sql`select 
            ifd.resource_id, 
            ifd.created_at,
            im.key, 
            im.value, 
            im.language,
            ir.rights,
            ir.duration,
            ir.height,
            ir.width,
            ir.nav_date,
            ir.viewing_direction,
            ir.default_thumbnail,
            ir.local_source,
            ir.thumbnail_json,
            ir.items_json,
            ir.source 
      from iiif_derived_resource ifd
        left join iiif_resource ir on ifd.resource_id = ir.id
        left outer join iiif_metadata im on ifd.resource_id = im.resource_id and im.site_id = ${siteId}
      where ifd.resource_id = ${canvasId}
        and ifd.resource_type = 'canvas'
        and ifd.site_id = ${siteId}
  `
  );

  const mappedMetadata = mapMetadata(canvas, row => {
    return {
      id: row.resource_id,
      type: 'Canvas',
      navDate: row.nav_date ? row.nav_date.toISOString() : undefined,
      thumbnail: [
        {
          id: row.default_thumbnail,
          type: 'Image',
          format: 'image/jpg',
        },
      ],
      height: row.height,
      width: row.width,
      duration: row.duration || undefined,
      source_id: row.source,
      items: row.items_json,
    };
  });

  // Deprecation block.
  if (mappedMetadata[0].items === null) {
    const { items, height, width } = await deprecationGetItemsJson({
      row: {
        id: canvas[0].resource_id,
        local_source: canvas[0].local_source,
        height: canvas[0].height,
        width: canvas[0].width,
        items_json: canvas[0].items_json,
        thumbnail_json: canvas[0].thumbnail_json,
      },
      connection: context.connection,
    });
    mappedMetadata[0].height = height;
    mappedMetadata[0].width = width;
    mappedMetadata[0].items = items;
  }

  context.response.body = { canvas: mappedMetadata[0] };
};
