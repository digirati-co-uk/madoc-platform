import { sql } from 'slonik';
import { userWithScope } from '../../../utility/user-with-scope';
import { RouteMiddleware } from '../../../types/route-middleware';
import { GetMetadata } from '../../../types/schemas/get-metadata';

// @todo join to original columns to get canonical value.
export const getCollectionMetadata: RouteMiddleware<{ id: number }> = async context => {
  const { siteId } = userWithScope(context, []);
  const collectionId = context.params.id;

  const collection = await context.connection.many<{
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
        where ifd.site_id=${siteId}
            and ifd.resource_id=${collectionId}
            and ifd.resource_type='collection'
            and im.site_id=${siteId}
        `
  );

  context.response.body = {
    fields: collection,
  } as GetMetadata;
};
