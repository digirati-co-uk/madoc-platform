import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';

export const siteMetadata: RouteMiddleware<{
  manifestId?: string;
  collectionId?: string;
  canvasId?: string;
}> = async context => {
  const { siteApi } = context.state;

  if (context.params.canvasId) {
    context.response.body = await siteApi.getCanvasMetadata(Number(context.params.canvasId));
    return;
  }

  if (context.params.manifestId) {
    context.response.body = await siteApi.getManifestMetadata(Number(context.params.manifestId));
    return;
  }

  if (context.params.collectionId) {
    context.response.body = await siteApi.getCollectionMetadata(Number(context.params.collectionId));
    return;
  }

  throw new NotFound();
};
