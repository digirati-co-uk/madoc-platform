import { RouteMiddleware } from '../../../types/route-middleware';

export const getCanvasDetail: RouteMiddleware = async context => {
  // This will combine the typical requests made on the canvas page and project canvas page.

  // Sample requests made:
  // - Annotation page
  // - getSiteCanvas
  // - getSiteCanvasPublishedModels
  // - getSiteProjectCanvasModel
  // - Manifest structure (next/prev)
  // - API Canvas
  // - getPersonalNote
  // - getSiteProjectManifestTasks
  // - getSiteProjectCanvasTasks
  // - model-preview

  // Some require access to the Tasks API:
  // - getSiteProjectManifestTasks
  // - getSiteProjectCanvasTasks

  // Things this route will not do, but will also be combined into a single request:
  // - Get the latest capture model (this is done on the client)
  // - Can the current user submit
  // - Does the user have access to the project
  // - Message to the current user

  // This second route will be refetched when the user makes contributions.

  context.response.body = { test: 'getCanvasDetail' };
};
