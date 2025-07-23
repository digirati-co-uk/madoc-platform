import { createAnnotation } from '../../../database/queries/resource-queries';
import { RouteMiddleware } from '../../../types/route-middleware';
import { userWithScope } from '../../../utility/user-with-scope';

export const createAnnotationApi: RouteMiddleware<{ annotation: any }> = async context => {
  const { id, siteId } = userWithScope(context, ['site.admin']);

  const { canonical_id } = await context.connection.one(
    createAnnotation(context.requestBody.annotation, siteId, id)
  );

  context.response.body = { id: canonical_id };
};
