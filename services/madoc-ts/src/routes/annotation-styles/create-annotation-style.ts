import invariant from 'tiny-invariant';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const createAnnotationStyle: RouteMiddleware<
  unknown,
  { name: string; data: { theme: any } }
> = async context => {
  const { siteId, id, name } = userWithScope(context, ['site.admin']);
  const body = context.requestBody;

  invariant(body.name, 'Missing style name');
  invariant(body.data, 'Missing data');
  invariant(body.data.theme, 'Missing theme');

  context.response.body = await context.annotationStyles.createAnnotationStyles(
    body.name,
    { id, name },
    body.data,
    siteId
  );
  context.response.status = 200;
};
