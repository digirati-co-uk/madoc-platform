import { RouteMiddleware } from '../../types/route-middleware';

export const siteTopic: RouteMiddleware<{ slug: string; type: string; id: string }> = async context => {
  context.response.status = 404;
  context.response.body = { error: 'not implemented' };
};
