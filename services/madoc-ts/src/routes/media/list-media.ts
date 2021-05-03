import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const listMedia: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const mediaCount = 24;
  const pageQuery = Number(context.query.page) || 1;

  const { total, totalPages, items } = await context.media.getMediaItems(pageQuery, siteId, {
    // Queries will come later.
    perPage: mediaCount,
  });

  context.response.body = {
    mediaItems: items,
    pagination: {
      page: pageQuery,
      totalResults: total,
      totalPages,
    },
  };
};
