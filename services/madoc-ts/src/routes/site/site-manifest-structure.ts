import { RouteMiddleware } from '../../types/route-middleware';

export const getSiteManifestStructure: RouteMiddleware<{ slug: string; id: string }> = async context => {
  const { id } = context.params;
  const { siteApi } = context.state;

  const structure = await siteApi.getManifestStructure(Number(id));

  context.response.status = 200;
  context.response.body = structure;
};
