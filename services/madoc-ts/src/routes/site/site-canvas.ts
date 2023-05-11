import { RouteMiddleware } from '../../types/route-middleware';
import { castBool } from '../../utility/cast-bool';

export type SiteCanvasQuery = {
  manifest_id?: number;
  collection_id?: number;
  parent_collection_ids?: number[];
  project_id?: number;
  plaintext?: boolean;
};

export const siteCanvas: RouteMiddleware<{ slug: string; id: string }> = async context => {
  // The manifestId, collectionId, parentCollectionIds and projectId are only for building a config request

  const canvasId = context.params.id;
  const { siteApi } = context.state;

  const backUpBody = {
    canvas: {
      label: { none: ['Canvas not found'] },
      id: canvasId,
      source_id: 'not-found',
    },
  };

  try {
    const canvas = await siteApi.getCanvasById(Number(canvasId));
    // @todo Check if project is running (or is admin)
    // If not running, then not found.
    // Get project collection id passing in page, and asking for only collections.
    // return collection id.
    context.response.status = 200;
    context.response.body = canvas;

    if (castBool(context.query.plaintext)) {
      try {
        const plaintext = await siteApi.getCanvasPlaintext(Number(canvasId));
        if (plaintext && plaintext.found) {
          context.response.body.plaintext = plaintext.transcription;
        }
      } catch (err) {
        // no op
      }
    }
  } catch (err: any) {
    if (err.status === 404) {
      context.response.body = backUpBody;
      context.response.status = 200;
    }
    console.log(err);
  }
  return;
};
