import { sql } from 'slonik';
import { userWithScope } from '../../../utility/user-with-scope';
import { CreateCollection } from '../../../types/schemas/create-collection';
import { RouteMiddleware } from '../../../types/route-middleware';
import { extractLinks } from '../../../utility/extract-links';
import { addLinks } from '../../../database/queries/linking-queries';

export const createCollection: RouteMiddleware<{}, CreateCollection> = async context => {
  const { siteId, userUrn } = userWithScope(context, ['site.admin']);

  const body = context.requestBody;
  const taskId = body.taskId || null;
  const json = JSON.stringify(body.collection);

  // collection json, sid integer, extra_context text, added_by text
  const { canonical_id, derived_id } = await context.connection.transaction(async connection => {
    const resp = await connection.one<{ canonical_id: number; derived_id: number }>(
      sql`select * from create_collection(${json}, ${siteId}, ${userUrn}, ${taskId})`
    );

    if (body.flat) {
      await context.connection.query(sql`
        update iiif_derived_resource set flat = true where id = ${derived_id}
      `);
    }

    await context.connection.query(sql`
      update iiif_derived_resource set published = false where id = ${derived_id}
    `);

    return resp;
  });

  try {
    // Links.
    const links = addLinks(extractLinks(body.collection, 'iiif'), canonical_id, siteId);
    if (links) {
      await context.connection.query(links);
    }
  } catch (err) {
    console.log(err);
  }

  context.response.body = { id: canonical_id };
  context.response.status = 201;
};
