import { userWithScope } from '../../../utility/user-with-scope';
import { sql } from 'slonik';
import { mapMetadata, MetadataField } from '../../../utility/iiif-metadata';
import { RouteMiddleware } from '../../../types/route-middleware';

export const listCanvases: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, []);

  const canvases = await context.connection.any<MetadataField>(sql`
    select 
            ifd.resource_id, 
            ifd.created_at, 
            im.key, 
            im.value, 
            im.language, 
            im.source from iiif_derived_resource ifd
        left outer join iiif_metadata im on ifd.resource_id = im.resource_id
    where ifd.site_id ~ ${siteId}
    and ifd.resource_type = 'canvas'
    and im.key = 'label'
    and im.site_id = ${siteId}
    group by ifd.resource_id, ifd.created_at, im.key, im.value, im.language, im.source
    `);

  context.response.body = mapMetadata(canvases);
};
