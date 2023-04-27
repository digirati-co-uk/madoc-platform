import { RouteMiddleware } from '../../types/route-middleware';
import { compatTopicTypes } from '../topics/topic-compat';

export const siteTopicTypes: RouteMiddleware<{ slug: string }> = async context => {
  const { siteApi } = context.state;

  const response = await siteApi.authority.getEntityTypes();
  context.response.body = compatTopicTypes(response);
};
