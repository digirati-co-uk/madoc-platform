import { optionalUserWithScope } from '../../../utility/user-with-scope';
import { RouteMiddleware } from '../../../types/route-middleware';
import { GetMetadata } from '../../../types/schemas/get-metadata';
import { getDerivedMetadata } from '../../../database/queries/metadata-queries';

export const getManifestMetadata: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = optionalUserWithScope(context, ['site.view']);
  const manifestId = Number(context.params.id);

  const manifest = await context.connection.any(getDerivedMetadata(manifestId, 'manifest', siteId));

  context.response.body = {
    fields: manifest,
  } as GetMetadata;
};
