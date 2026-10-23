import { sql } from 'slonik';
import { invalidateIIIF, requireIIIFResource } from '../../../repository/iiif-annotations';
import { updateResourceDetailsQuery } from '../../../database/queries/update-resource-details';
import { RouteMiddleware } from '../../../types/route-middleware';
import { userWithScope } from '../../../utility/user-with-scope';

export interface UpdateManifestDetailsRequest {
  default_thumbnail?: string;
  navDate?: string;
  rights?: string;
  viewingDirection?: string;
}

export const updateManifestDetails: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const request = context.requestBody as UpdateManifestDetailsRequest;
  const manifestId = Number(context.params.id);

  await requireIIIFResource(context.connection, siteId, manifestId);
  await updateResourceDetailsQuery(context.connection, manifestId, request);
  if (request.navDate !== undefined)
    await context.connection.query(
      sql`update iiif_derived_resource set extra_properties = extra_properties || ${sql.json({ navDate: request.navDate })}::jsonb where resource_id = ${manifestId} and site_id = ${siteId}`
    );
  await invalidateIIIF(context.connection, siteId, manifestId);

  context.response.body = { ok: true, id: manifestId, ...request };
};
