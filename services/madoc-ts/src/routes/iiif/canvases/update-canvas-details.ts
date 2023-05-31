import {
  updateResourceDetailsQuery,
  UpdateResourceDetailsRequest,
} from '../../../database/queries/update-resource-details';
import { RouteMiddleware } from '../../../types/route-middleware';
import { userWithScope } from '../../../utility/user-with-scope';

export const updateCanvasDetails: RouteMiddleware = async context => {
  userWithScope(context, ['site.admin']);
  const request = context.requestBody as UpdateResourceDetailsRequest;
  const canvasId = Number(context.params.id);

  await updateResourceDetailsQuery(context.connection, canvasId, request);

  context.response.body = { ok: true, id: canvasId, ...request };
};
