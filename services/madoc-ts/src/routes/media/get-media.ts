import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const getMedia: RouteMiddleware<{ mediaId: string }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  context.response.body = {
    media: await context.media.getMediaById(context.params.mediaId, siteId),
  };
};
