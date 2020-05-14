import { sql } from 'slonik';
import { userWithScope } from '../../../utility/user-with-scope';
import { mapMetadata } from '../../../utility/iiif-metadata';
import { RouteMiddleware } from '../../../types/route-middleware';
import { readLocalSource } from '../../../utility/read-local-source';

export const getCanvas: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, []);

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
            im.source from iiif_derived_resource ifd
        left join iiif_resource ir on ifd.resource_id = ir.id
        left outer join iiif_metadata im on ifd.resource_id = im.resource_id and im.site_id = ${siteId}
      where ifd.resource_id = ${canvasId}
        and ifd.resource_type = 'canvas'
        and ifd.site_id = ${siteId}
    group by ifd.resource_id, 
             ifd.created_at, 
             im.key, 
             im.value, 
             im.language, 
             im.source, 
             ir.rights,
             ir.duration,
             ir.height,
             ir.width,
             ir.nav_date,
             ir.viewing_direction,
             ir.default_thumbnail,
             ir.local_source
  `
  );

  const mappedMetadata = mapMetadata(canvas, row => {
    return {
      id: row.resource_id,
      navDate: row.nav_date ? row.nav_date.toISOString() : undefined,
      thumbnail: row.default_thumbnail,
      height: row.height,
      width: row.width,
      duration: row.duration || undefined,
      source: readLocalSource(row.local_source),
    };
  });

  context.response.body = { canvas: mappedMetadata[0] };
};
