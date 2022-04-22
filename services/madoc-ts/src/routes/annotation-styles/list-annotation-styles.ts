import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const listAnnotationStyles: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  context.response.body = { styles: await context.annotationStyles.listAnnotationStyles(siteId) };
};
