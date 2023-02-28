import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';

export const siteTopic: RouteMiddleware<{ type: string; topic: string }> = async context => {
  const { siteApi } = context.state;

  const slug = context.params.topic;
  const topicTypeSlug = context.params.type;

  const response = await siteApi.authority.getEntity(topicTypeSlug, slug);

  if (response.type_slug !== topicTypeSlug) {
    throw new NotFound();
  }

  context.response.body = response;
};
