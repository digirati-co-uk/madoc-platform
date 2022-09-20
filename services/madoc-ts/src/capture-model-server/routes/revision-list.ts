import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const revisionListApi: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['models.admin']);

  const page = context.query.page ? Number(context.query.page) : 1;

  context.body = await context.captureModels.listAllRevisions(
    {
      page,
      perPage: 20,
    },
    siteId
  );
};
