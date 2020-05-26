import { RouteMiddleware } from '../../types/route-middleware';

export const siteTopicType: RouteMiddleware<{ slug: string; type: string }> = async context => {
  context.response.status = 404;
  context.response.body = { error: 'not implemented' };
};
