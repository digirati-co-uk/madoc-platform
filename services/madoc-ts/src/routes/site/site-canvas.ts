import { RouteMiddleware } from '../../types/route-middleware';

export type SiteCanvasQuery = {
  manifest_id?: number;
  collection_id?: number;
  parent_collection_ids?: number[];
  project_id?: number;
};

export const siteCanvas: RouteMiddleware<{ slug: string; id: string }> = async context => {
  // The manifestId, collectionId, parentCollectionIds and projectId are only for building a config request

  const canvasId = context.params.id;
  const { siteApi } = context.state;

  const canvas = await siteApi.getCanvasById(Number(canvasId));
  // @todo Check if project is running (or is admin)
  // If not running, then not found.
  // Get project collection id passing in page, and asking for only collections.
  // return collection id.
  context.response.status = 200;
  context.response.body = canvas;

  return;
};
