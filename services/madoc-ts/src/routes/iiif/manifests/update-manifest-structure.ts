import {
  listAnnotationPages,
  saveAnnotationDocument,
  invalidateIIIF,
  requireIIIFResource,
} from '../../../repository/iiif-annotations';
import { sql } from 'slonik';
import { RouteMiddleware } from '../../../types/route-middleware';
import { UpdateStructureList } from '../../../types/schemas/item-structure-list';
import { SQL_INT_ARRAY } from '../../../utility/postgres-tags';
import { userWithScope } from '../../../utility/user-with-scope';
import { api } from '../../../gateway/api.server';

export const updateManifestStructure: RouteMiddleware<{ id: number }, UpdateStructureList> = async context => {
  const { siteId, id, userUrn } = userWithScope(context, ['site.admin']);

  const manifestId = context.params.id;
  const canvasIds = context.requestBody.item_ids;
  await requireIIIFResource(context.connection, siteId, Number(manifestId));
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

  await context.connection.transaction(async connection => {
    // Serialize text rebuilding with annotation edits, deletion, and download completion.
    await connection.query(sql`select id from iiif_linking
      where site_id = ${siteId} and resource_id = ${manifestId} and property = 'annotations'
      order by id for update`);
    for (const page of await listAnnotationPages(connection, siteId, Number(manifestId))) {
      if (page.properties.document) await saveAnnotationDocument(connection, siteId, page, page.properties.document);
    }
    await invalidateIIIF(connection, siteId, Number(manifestId));
  });

  // Background task.
  (async () => {
    try {
      const userApi = api.asUser({ userId: id, siteId });
      await userApi.indexManifest(manifestId);
      await userApi.postUniversalChangeToStreams({
        id: manifestId,
        type: 'manifest',
        summary: `Manifest structural changes`,
      });
    } catch (e) {
      console.log(e);
    }
  })();

  await context.connection.query(sql`select refresh_item_counts()`);

  context.response.status = 204;
};
