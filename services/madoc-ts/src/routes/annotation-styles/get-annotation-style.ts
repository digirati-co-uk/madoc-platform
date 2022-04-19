import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const getAnnotationStyle: RouteMiddleware<{ id: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const id = Number(context.params.id);

  context.response.body = await context.annotationStyles.getAnnotationStyles(id, siteId);
};
