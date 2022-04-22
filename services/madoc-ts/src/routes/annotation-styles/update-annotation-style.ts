import invariant from 'tiny-invariant';
import { AnnotationStyles } from '../../types/annotation-styles';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const updateAnnotationStyle: RouteMiddleware<{ id: string }, AnnotationStyles> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const id = Number(context.params.id);
  const body = context.requestBody;

  invariant(body, 'Missing body');
  invariant(body.id, 'Missing ID');
  invariant(body.id === id, 'ID does not body match');
  invariant(body.theme, 'Missing theme');

  await context.annotationStyles.updateAnnotationStyles(body, siteId);

  context.response.status = 200;
};
