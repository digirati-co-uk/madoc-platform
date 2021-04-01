import { sql } from 'slonik';
import { RouteMiddleware } from '../../../types/route-middleware';
import { NotFound } from '../../../utility/errors/not-found';
import { optionalUserWithScope } from '../../../utility/user-with-scope';

export const getCanvasReference: RouteMiddleware = async context => {
  optionalUserWithScope(context, []);
  const sourceId = context.query.source_id;

  if (!sourceId) {
    throw new NotFound();
  }

  const resp = await context.connection.maybeOne<{ id: number }>(
    sql`select id from iiif_resource where source = ${sourceId}`
  );

  if (!resp) {
    throw new NotFound();
  }

  context.response.body = {
    id: resp.id,
  };
};
