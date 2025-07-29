import { addCanvasAnnotations } from '../../../database/queries/resource-queries';
import { RouteMiddleware } from '../../../types/route-middleware';
import { userWithScope } from '../../../utility/user-with-scope';

export const updateCanvasAnnotationsApi: RouteMiddleware<{ canvasId: string }, { annotations: number[] }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const canvasId = Number(context.params.canvasId);
  const annotationIds = context.requestBody.annotations;

  await context.connection.none(addCanvasAnnotations(canvasId, annotationIds, siteId));

  context.response.status = 204;
};
