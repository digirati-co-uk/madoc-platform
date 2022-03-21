import { userWithScope } from '../../../utility/user-with-scope';
import { sql } from 'slonik';
import { RouteMiddleware } from '../../../types/route-middleware';
import { CreateCanvas } from '../../../types/schemas/create-canvas';
import { addLinks } from '../../../database/queries/linking-queries';
import { extractLinks } from '../../../utility/extract-links';
import { api } from '../../../gateway/api.server';

export const createCanvas: RouteMiddleware<unknown, CreateCanvas> = async context => {
  const { userUrn, siteId } = userWithScope(context, ['site.admin']);

  const canvas = context.requestBody.canvas;
  const canvasJson = JSON.stringify(context.requestBody.canvas);

  const localSource = null; // This is no longer required.
  const thumbnail = context.requestBody.thumbnail || null;

  const { canonical_id } = await context.connection.one<{ derived_id: number; canonical_id: number }>(
    sql`select * from create_canvas(${canvasJson}, ${localSource}, ${thumbnail}, ${siteId}, ${userUrn})`
  );

  if (canvas.items && canvas.thumbnail) {
    await context.connection.query(
      sql`update iiif_resource
            set width          = ${canvas.width || 0},
                height         = ${canvas.height || 0},
                duration       = ${canvas.duration || null},
                items_json     = ${canvas.items ? sql.json(canvas.items) : null},
                thumbnail_json = ${canvas.thumbnail ? sql.json(canvas.thumbnail) : null}
            where id = ${canonical_id}`
    );
  }

  try {
    // Links.
    const links = addLinks(extractLinks(context.requestBody.canvas as any, 'iiif'), canonical_id, siteId);
    if (links) {
      await context.connection.query(links);
    }
  } catch (err) {
    console.log(err);
  }

  // search index
  await api.asUser({ siteId }).indexCanvas(canonical_id);

  context.response.body = { id: canonical_id };
  context.response.status = 201;
};
