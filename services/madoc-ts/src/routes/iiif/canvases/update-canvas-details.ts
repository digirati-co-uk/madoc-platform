import { sql } from 'slonik';
import { invalidateIIIF, requireIIIFResource } from '../../../repository/iiif-annotations';
import {
  updateResourceDetailsQuery,
  UpdateResourceDetailsRequest,
} from '../../../database/queries/update-resource-details';
import { RouteMiddleware } from '../../../types/route-middleware';
import { userWithScope } from '../../../utility/user-with-scope';

export const updateCanvasDetails: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const request = context.requestBody as UpdateResourceDetailsRequest;
  const canvasId = Number(context.params.id);

  await requireIIIFResource(context.connection, siteId, canvasId);
  await updateResourceDetailsQuery(context.connection, canvasId, request);
  if (request.navDate !== undefined)
    await context.connection.query(
      sql`update iiif_derived_resource set extra_properties = extra_properties || ${sql.json({ navDate: request.navDate })}::jsonb where resource_id = ${canvasId} and site_id = ${siteId}`
    );
  await invalidateIIIF(context.connection, siteId, canvasId);

  context.response.body = { ok: true, id: canvasId, ...request };
};
