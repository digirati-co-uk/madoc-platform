import { RouteMiddleware } from '../../types/route-middleware';

type SiteSearchQuery = {
  q?: string;
  type?: string;
  project?: string;
  page?: string;
};

export const siteSearch: RouteMiddleware<{ slug: string }> = async context => {
  context.response.status = 404;
  context.response.body = { error: 'not implemented' };
};
