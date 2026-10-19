import { preserveIIIFProperties } from '../../../repository/iiif-annotations';
import { enqueueAnnotationPages } from '../../../iiif/queue-annotation-pages';
import { AnnotationPageRecord } from '../../../iiif/types';
import { api } from '../../../gateway/api.server';
import { userWithScope } from '../../../utility/user-with-scope';
import { sql } from 'slonik';
import { RouteMiddleware } from '../../../types/route-middleware';
import { CreateCanvas } from '../../../types/schemas/create-canvas';
import { addLinks } from '../../../database/queries/linking-queries';
import { extractLinks } from '../../../utility/extract-links';

export const createCanvas: RouteMiddleware<unknown, CreateCanvas> = async context => {
  const { userUrn, siteId, id: userId } = userWithScope(context, ['site.admin']);

  const canvas = context.requestBody.canvas;
  const canvasJson = JSON.stringify(context.requestBody.canvas);

  const localSource = null; // This is no longer required.
  const thumbnail = context.requestBody.thumbnail || null;

  let pendingPages: readonly AnnotationPageRecord[] = [];
  const canonical_id = await context.connection.transaction(async connection => {
    const { canonical_id } = await connection.one<{ derived_id: number; canonical_id: number }>(
      sql`select * from create_canvas(${canvasJson}, ${localSource}, ${thumbnail}, ${siteId}, ${userUrn})`
    );

    if (canvas.items || canvas.thumbnail) {
      await connection.query(
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
        await connection.query(links);
      }
    } catch (err) {
      console.log(err);
    }

    pendingPages = (await preserveIIIFProperties(connection, siteId, canonical_id, canvas)).pending;
    return canonical_id;
  });

  const userApi = api.asUser({ siteId, userId }, {}, true);
  context.disposableApis.push(userApi);
  await enqueueAnnotationPages(userApi, pendingPages, siteId, userId);

  context.response.body = { id: canonical_id };
  context.response.status = 201;
};
