import { sql } from 'slonik';
import { userWithScope } from '../../../utility/user-with-scope';
import { RouteMiddleware } from '../../../types/route-middleware';
import { GetMetadata } from '../../../types/schemas/get-metadata';

export const getManifestMetadata: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, []);
  const manifestId = context.params.id;

  const manifest = await context.connection.many<{
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
            and ifd.resource_type = 'manifest'
            and ifd.resource_id = ${manifestId}
            and im.site_id = ${siteId}
        order by im.id
        `
  );

  context.response.body = {
    fields: manifest,
  } as GetMetadata;
};
