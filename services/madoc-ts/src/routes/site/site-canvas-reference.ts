import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';

export const siteCanvasSource: RouteMiddleware<{ slug: string; id: string }> = async context => {
  const sourceId = context.query.source_id;
  const { siteApi } = context.state;

  if (!sourceId) {
    throw new NotFound();
  }

  const canvas = await siteApi.getCanvasSource(sourceId);

  context.response.status = 200;
  context.response.body = canvas;

  return;
};
