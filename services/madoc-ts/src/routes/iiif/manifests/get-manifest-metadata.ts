import { sql } from 'slonik';
import { userWithScope } from '../../../utility/user-with-scope';
import { RouteMiddleware } from '../../../types/route-middleware';
import { GetMetadata } from '../../../types/schemas/get-metadata';
import { getDerivedMetadata } from '../../../database/queries/metadata-queries';

export const getManifestMetadata: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, []);
  const manifestId = Number(context.params.id);

  const manifest = await context.connection.many(getDerivedMetadata(manifestId, 'manifest', siteId));

  context.response.body = {
    fields: manifest,
  } as GetMetadata;
};
