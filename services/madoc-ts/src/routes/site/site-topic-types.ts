import { RouteMiddleware } from '../../types/route-middleware';

export const siteTopicTypes: RouteMiddleware<{ slug: string }> = async context => {
  const { siteApi } = context.state;

  const response = await siteApi.enrichment.getEntityTypes();
  context.response.body = response;
};
