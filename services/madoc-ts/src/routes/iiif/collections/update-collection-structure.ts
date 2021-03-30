import { sql } from 'slonik';
import { RouteMiddleware } from '../../../types/route-middleware';
import { UpdateStructureList } from '../../../types/schemas/item-structure-list';
import { userWithScope } from '../../../utility/user-with-scope';
import { SQL_INT_ARRAY } from '../../../utility/postgres-tags';
import { RequestError } from '../../../utility/errors/request-error';

export const updateCollectionStructure: RouteMiddleware<{ id: number }, UpdateStructureList> = async context => {
  const { siteId, userUrn } = userWithScope(context, ['site.admin']);

  const collectionId = context.params.id;
  const manifestIds = context.requestBody.item_ids;
  const itemFilter = sql`site_id = ${siteId} and resource_id = ${collectionId}`;

  const flatExcluded = await context.connection.any<{ resource_id: number }>(sql`
    select resource_id from iiif_derived_resource where site_id = ${siteId} and flat = true and resource_id = any (${sql.array(
    manifestIds,
    SQL_INT_ARRAY
  )})
  `);

  if (manifestIds.indexOf(collectionId) !== -1) {
    throw new RequestError('Cannot add collection to itself');
  }

  if (flatExcluded.length) {
    throw new RequestError('Cannot add flat collection to another collection');
  }

  // Find the originals.
  const ids = (
    await context.connection.any(sql<{ id: number }>`
      select item_id as id from iiif_derived_resource_items where ${itemFilter}
    `)
  ).map(({ id }) => id);

  // First remove.
  const toRemove = ids.filter(id => manifestIds.indexOf(id) === -1);
  if (toRemove.length) {
    const removeQuery = sql`
      delete
        from iiif_derived_resource_items
        where ${itemFilter}
          and (item_id = any (${sql.array(toRemove, SQL_INT_ARRAY)})) 
    `;

    await context.connection.query(removeQuery);
  }

  // Then add missing.
  const toAdd = manifestIds.filter(id => ids.indexOf(id) === -1);
  if (toAdd.length) {
    const toAddArray = sql.array(toAdd, SQL_INT_ARRAY);
    const insertQuery = sql`
      select * from 
        add_sub_resources(${siteId}, ${collectionId}, ${toAddArray}, ${userUrn})
    `;

    await context.connection.query(insertQuery);

    // A flat collection contains ALL of the manifests inside of it.
    // This additional check will look to parents of this resource to find root collections
    // and then add itself, or it's manifests (if its a collection) to the resource.
    for (const toAddItem of toAdd) {
      await context.connection.query(
        sql`select * from update_flat_collection_items(${toAddItem}, ${collectionId}::int, ${siteId})`
      );
    }
  }

  // Then reorder everything at the end.
  const reorderArray = sql.array(manifestIds, SQL_INT_ARRAY);
  // Then reorder.
  const updateQuery = sql`
    update iiif_derived_resource_items 
        set item_index = array_position(${reorderArray}, item_id)
    where ${itemFilter} and item_id = any(${reorderArray})
  `;

  await context.connection.query(updateQuery);

  await context.connection.query(sql`select refresh_item_counts()`);

  context.response.status = 200;
};
