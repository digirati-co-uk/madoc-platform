import { RouteMiddleware } from '../../types/route-middleware';
import { compatTopicType } from '../topics/topic-compat';

export const siteTopicType: RouteMiddleware<{ type: string }> = async context => {
  const { siteApi } = context.state;

  const slug = context.params.type;
  const response = await siteApi.authority.getEntityType(slug);
  const topics = await siteApi.authority.getEntities(slug);

  context.response.body = compatTopicType(response, topics);
};
