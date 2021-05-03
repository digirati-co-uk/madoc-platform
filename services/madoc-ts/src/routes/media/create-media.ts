import { CreateMediaRow } from '../../types/media';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const createMedia: RouteMiddleware<any, CreateMediaRow> = async context => {
  const { name, siteId, id } = userWithScope(context, ['site.admin']);
  const body = context.requestBody;

  context.response.body = await context.media.createMedia(body, { siteId, user: { id, name } });
};
