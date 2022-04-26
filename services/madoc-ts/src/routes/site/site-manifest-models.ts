import { RouteMiddleware } from '../../types/route-middleware';

export const siteManifestModels: RouteMiddleware<{
  slug: string;
  projectSlug: string;
  manifestId: string;
}> = async context => {
  const projectSlug = context.params.projectSlug;
  const manifestId = context.params.manifestId;
  const { siteApi } = context.state;

  const { model } = await siteApi.getProjectModel(projectSlug, `urn:madoc:manifest:${manifestId}`);

  context.response.status = 200;
  context.response.body = { model };

  return;
};
