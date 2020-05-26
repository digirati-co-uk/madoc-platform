import { RouteMiddleware } from '../../types/route-middleware';

export const siteTopicTypes: RouteMiddleware<{ slug: string }> = async context => {
  context.response.status = 404;
  context.response.body = { error: 'not implemented' };
};
