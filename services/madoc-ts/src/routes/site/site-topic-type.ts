import { RouteMiddleware } from '../../types/route-middleware';
import { compatTopicType } from '../topics/topic-compat';

export const siteTopicType: RouteMiddleware<{ type: string; order_by: string }> = async context => {
  const { siteApi } = context.state;

  const slug = context.params.type;
  const page = context.query.page ? Number(context.query.page) : 1;
  const order_by = context.query.order_by ? context.query.order_by : 'test';

  const response = await siteApi.enrichment.getEntityType(slug);
  const topics = await siteApi.enrichment.getEntities(slug, page, order_by);

  context.response.body = compatTopicType(response, topics);
};
