import { RouteMiddleware } from '../../types/route-middleware';
import { castBool } from '../../utility/cast-bool';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const revisionApi: RouteMiddleware<{ id: string }> = async context => {
  const { siteId, id } = optionalUserWithScope(context, ['models.contribute']);

  const showRevised = castBool(context.query.show_revised as string);

  context.body = await context.captureModels.getRevision(context.params.id, siteId, {
    userId: id,
    showRevised,
  });
};
