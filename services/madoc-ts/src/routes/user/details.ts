import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';
import { api } from '../../gateway/api.server';

export const userDetails: RouteMiddleware<{ slug: string }> = async context => {
  const { id, userUrn, siteId } = userWithScope(context, ['site.view']);

  const userApi = api.asUser({ siteId, userId: id });

  const statistics = await userApi.getAllTaskStats({ user_id: userUrn, type: 'crowdsourcing-task' });

  context.response.body = {
    ...(await context.omeka.getUser(id)),
    currentSiteId: siteId,
    statistics,
  };
};
