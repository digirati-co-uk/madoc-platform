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
  userWithScope(context, ['site.admin']);
  const request = context.requestBody as UpdateManifestDetailsRequest;
  const manifestId = Number(context.params.id);

  await updateResourceDetailsQuery(context.connection, manifestId, request);

  context.response.body = { ok: true, id: manifestId, ...request };
};
