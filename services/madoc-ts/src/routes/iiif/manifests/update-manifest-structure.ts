import { sql } from 'slonik';
import { RouteMiddleware } from '../../../types/route-middleware';
import { UpdateStructureList } from '../../../types/schemas/item-structure-list';
import { SQL_INT_ARRAY } from '../../../utility/postgres-tags';
import { userWithScope } from '../../../utility/user-with-scope';
import { api } from '../../../gateway/api.server';

export const updateManifestStructure: RouteMiddleware<{ id: number }, UpdateStructureList> = async context => {
  const { siteId, userUrn } = userWithScope(context, ['site.admin']);

  const manifestId = context.params.id;
  const canvasIds = context.requestBody.item_ids;
  const itemFilter = sql`site_id = ${siteId} and resource_id = ${manifestId}`;

  // Find the originals.
  const ids = (
    await context.connection.any(sql<{ id: number }>`
      select item_id as id from iiif_derived_resource_items where ${itemFilter}
    `)
  ).map(({ id }) => id);

  await context.connection.transaction(async handler => {
    // First remove.
    const toRemove = ids.filter(id => canvasIds.indexOf(id) === -1);
    if (toRemove.length) {
      const removeQuery = sql`
        delete
          from iiif_derived_resource_items
          where ${itemFilter}
            and (item_id = any (${sql.array(toRemove, SQL_INT_ARRAY)}))
      `;

      await handler.query(removeQuery);
    }

    await handler.any(sql`
        select * from add_sub_resources(
            ${siteId},
            ${manifestId},
            ${sql.array(canvasIds, SQL_INT_ARRAY)},
            ${userUrn}
      )
    `);
  });
  try {
    const userApi = api.asUser({ siteId });
    userApi.indexManifest(manifestId);
  } catch (e) {
    console.log(e);
  }

  await context.connection.query(sql`select refresh_item_counts()`);

  context.response.status = 200;
};
