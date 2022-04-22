import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const deleteAnnotationStyle: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const id = Number(context.params.id);

  context.response.body = await context.annotationStyles.deleteAnnotationStyles(id, siteId);
};
