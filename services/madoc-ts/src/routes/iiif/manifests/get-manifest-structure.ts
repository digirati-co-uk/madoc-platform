import { optionalUserWithScope } from '../../../utility/user-with-scope';
import { sql } from 'slonik';
import { RouteMiddleware } from '../../../types/route-middleware';
import { ItemStructureList, ItemStructureListItem } from '../../../types/schemas/item-structure-list';
import { mapMetadata, MetadataField } from '../../../utility/iiif-metadata';

/**
 * @todo when canvas exist.
 * @todo label and id for manifest
 * @param context
 */
export const getManifestStructure: RouteMiddleware<{ id: number }> = async context => {
  const { siteId } = optionalUserWithScope(context, []);

  const manifest_id = context.params.id;

  // @todo use getItemStructures
  const query = sql<MetadataField>`
    select distinct im.resource_id as resource_id,
           im.key         as key,
           im.value       as value,
           im.language    as language,
           im.source      as source,
           canvases.item_index as index,
           iiif_resource.default_thumbnail as thumbnail
    from iiif_derived_resource_items canvases
             left join iiif_resource on canvases.item_id = iiif_resource.id
             left join iiif_metadata im on (im.resource_id = canvases.item_id)
    where im.key = 'label'
      and im.site_id = ${siteId}
      and canvases.resource_id = ${manifest_id}
      and canvases.site_id = ${siteId}
    order by canvases.item_index
  `;

  const rows = await context.connection.any(query);

  context.response.body = { items: mapMetadata<ItemStructureListItem>(rows) } as ItemStructureList;
};
