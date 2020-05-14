import { sql } from 'slonik';
import { userWithScope } from '../../../utility/user-with-scope';
import { RouteMiddleware } from '../../../types/route-middleware';

// @todo maybe de-duplicate these endpoints.
export const getCanvasMetadata: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, []);
  const canvasId = context.params.id;

  const canvas = await context.connection.many<{
    key: string;
    value: string;
    language: string;
    source: string;
    edited: boolean;
    auto_update: boolean;
    readonly: boolean;
    data: any;
  }>(
    sql`select 
            im.id,
            im.key, 
            im.value, 
            im.language, 
            im.source,
            im.edited,
            im.auto_update,
            im.readonly,
            im.data
        from iiif_derived_resource ifd
        left join  iiif_metadata im 
            on ifd.resource_id = im.resource_id 
        where ifd.site_id = ${siteId}
            and ifd.resource_type = 'canvas'
            and ifd.resource_id=${canvasId}
            and im.site_id=${siteId}
        group by im.id, im.key, im.value, im.language, im.source, im.edited, im.auto_update, im.readonly, im.data
      `
  );

  context.response.body = {
    fields: canvas,
  };
};
