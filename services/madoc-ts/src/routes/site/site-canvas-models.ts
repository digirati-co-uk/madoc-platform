import { RouteMiddleware } from '../../types/route-middleware';

export const siteCanvasModels: RouteMiddleware<{
  slug: string;
  projectSlug: string;
  canvasId: string;
}> = async context => {
  const projectSlug = context.params.projectSlug;
  const canvasId = context.params.canvasId;
  const { siteApi } = context.state;

  const { model } = await siteApi.getProjectModel(projectSlug, `urn:madoc:canvas:${canvasId}`);

  context.response.status = 200;
  context.response.body = { model };

  return;
};
