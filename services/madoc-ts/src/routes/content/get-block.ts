import { sql } from 'slonik';
import { BlockJoinedProperties, pageSlotReducer } from '../../database/queries/site-editorial';
import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const getBlock: RouteMiddleware<{ blockId: string }> = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.read']);
  const blockId = Number(context.params.blockId);

  const results = await context.connection.any(sql<BlockJoinedProperties>`
    select  
        -- Block properties
        sb.id as block__id,
        sb.static_data as block__static_data,
        sb.name as block__name,
        sb.type as block__type,
        sb.lazy as block__lazy,
        sb.i18n_languages as block__i18n_languages,
        sb.i18n_sort_key as block__i18n_sort_key,
        sb.i18n_fallback as block__i18n_fallback
    
    from site_block sb
    where sb.id = ${blockId} and sb.site_id = ${siteId}
  `);

  const table = pageSlotReducer(results);
  const block = table.blocks[blockId];

  context.response.body = {
    block,
  };
};
