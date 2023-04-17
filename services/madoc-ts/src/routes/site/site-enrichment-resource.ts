import { RouteMiddleware } from '../../types/route-middleware';

export const siteResource: RouteMiddleware<{ id: string }> = async context => {
  const { siteApi } = context.state;

  const id = context.params.id;

  const response = await siteApi.authority.getEnrichmentResource(id);

  context.response.body = response;
};
