import { sql } from 'slonik';
import { userWithScope } from '../../../utility/user-with-scope';
import { RouteMiddleware } from '../../../types/route-middleware';
import { mapMetadata, MetadataField } from '../../../utility/iiif-metadata';
import { ItemStructureListItem } from '../../../types/schemas/item-structure-list';

export const getCollectionStructure: RouteMiddleware<{ id: number }> = async context => {
  const { siteId } = userWithScope(context, []);

  const collectionId = context.params.id;

  const query = sql<MetadataField>`
    select distinct im.resource_id as resource_id,
           im.key         as key,
           im.value       as value,
           im.language    as language,
           im.source      as source,
           manifests.item_index as index
    from iiif_derived_resource_items manifests
             left join iiif_metadata im on (im.resource_id = manifests.item_id)
    where im.key = 'label'
      and im.site_id = ${siteId}
      and manifests.resource_id = ${collectionId}
    order by manifests.item_index
  `;

  const rows = await context.connection.any(query);

  context.response.body = { items: mapMetadata<ItemStructureListItem>(rows) };
};
