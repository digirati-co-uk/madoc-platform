import { sql } from 'slonik';
import { RouteMiddleware } from '../../../types/route-middleware';
import { UpdateStructureList } from '../../../types/schemas/item-structure-list';
import { SQL_INT_ARRAY } from '../../../utility/postgres-tags';
import { userWithScope } from '../../../utility/user-with-scope';

export const updateManifestStructure: RouteMiddleware<{ id: number }, UpdateStructureList> = async context => {
  const { siteId, userUrn } = userWithScope(context, ['site.admin']);

  const manifestId = context.params.id;
  const canvasIds = context.requestBody.item_ids;

  await context.connection.any(sql`
      select * from add_sub_resources(
          ${siteId},
          ${manifestId},
          ${sql.array(canvasIds, SQL_INT_ARRAY)},
          ${userUrn}
      )
  `);

  context.response.status = 200;
};
