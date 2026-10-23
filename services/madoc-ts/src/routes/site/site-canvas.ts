import { RouteMiddleware } from '../../types/route-middleware';
import { castBool } from '../../utility/cast-bool';
import { getCanvasAnnotationPages } from '../../repository/iiif-annotations';
import { loadCanvasPlaintext } from '../iiif/canvases/get-canvas-plaintext';

export type SiteCanvasQuery = {
  manifest_id?: number;
  collection_id?: number;
  parent_collection_ids?: number[];
  project_id?: number;
  plaintext?: boolean;
  annotations?: boolean;
};

export const siteCanvas: RouteMiddleware<{ slug: string; id: string }> = async context => {
  // The manifestId, collectionId, parentCollectionIds and projectId are only for building a config request

  const canvasId = context.params.id;
  const { siteApi } = context.state;
  const siteId = context.state.site.id;
  const admin = context.state.jwt?.site.id === siteId && !!context.state.jwt.scope.includes('site.admin');

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

    if (castBool(context.query.annotations)) {
      context.response.body.canvas.annotations = await getCanvasAnnotationPages(
        context.connection,
        siteId,
        Number(canvasId),
        admin
      );
    }

    if (castBool(context.query.plaintext)) {
      try {
        const plaintext = await loadCanvasPlaintext(context, siteId, Number(canvasId), admin);
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
