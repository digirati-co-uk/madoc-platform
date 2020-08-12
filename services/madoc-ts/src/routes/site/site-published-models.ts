import { RouteMiddleware } from '../../types/route-middleware';

export const sitePublishedModels: RouteMiddleware<{ slug: string; id: string }> = async context => {
  const { siteApi } = context.state;
  const { derived_from } = context.query;

  const models = await siteApi.getAllCaptureModels({
    target_id: `urn:madoc:canvas:${context.params.id}`,
    target_type: 'Canvas',
    derived_from,
  });

  const ms = [];

  for (const model of models) {
    ms.push(siteApi.getCaptureModel(model.id, { published: true }));
  }

  context.response.body = {
    models: await Promise.all(ms),
  };
};
