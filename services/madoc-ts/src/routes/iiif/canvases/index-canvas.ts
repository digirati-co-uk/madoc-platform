import { traverseDocument } from '@capture-models/helpers';
import { BaseField } from '@capture-models/types';
import {
  isParagraphEntity,
  ParagraphEntity,
  PARAGRAPHS_PROFILE,
} from '../../../extensions/capture-models/Paragraphs/Paragraphs.helpers';
import { api } from '../../../gateway/api.server';
import { RouteMiddleware } from '../../../types/route-middleware';
import { SearchIngestRequest } from '../../../types/search';
import { optionalUserWithScope } from '../../../utility/user-with-scope';
import { getParentResources } from '../../../database/queries/resource-queries';

export const indexCanvas: RouteMiddleware<{ id: string }> = async context => {
  const { siteId, siteUrn } = optionalUserWithScope(context, []);
  const userApi = api.asUser({ siteId });
  const canvasId = Number(context.params.id);

  const { canvas } = await userApi.getCanvasById(canvasId);
  const sourceId =
    canvas && canvas.source && (canvas.source['@id'] || canvas.source.id)
      ? canvas.source['@id'] || canvas.source.id
      : `http://madoc.dev/urn:madoc:canvas:${canvasId}`;

  const manifestsWithin = await context.connection.any(getParentResources(canvasId as any, siteId));
  const searchPayload: SearchIngestRequest = {
    id: `urn:madoc:canvas:${canvasId}`,
    type: 'Canvas',
    resource: {
      type: 'Canvas',
      id: sourceId,
      label: canvas.label as any,
      thumbnail: canvas.thumbnail as any,
      summary: canvas.summary,
      metadata: canvas.metadata,
      rights: (canvas as any).rights,
      provider: (canvas as any).provider,
      requiredStatement: canvas.requiredStatement,
      navDate: (canvas as any).navDate,
    },
    thumbnail: canvas.thumbnail as string,
    contexts: [
      { id: siteUrn, type: 'Site' },
      // Should this be contexts or manifests here? Do canvases have site contexts too?
      ...manifestsWithin.map(({ resource_id }) => {
        return { id: `urn:madoc:manifest:${resource_id}`, type: 'Manifest' };
      }),
      {
        id: `urn:madoc:canvas:${canvasId}`,
        type: 'Canvas',
      },
    ],
  };

  try {
    await api.searchGetIIIF(`urn:madoc:canvas:${canvasId}`);

    await userApi.searchReIngest(searchPayload);
  } catch (err) {
    await userApi.searchIngest(searchPayload);
  }

  // 1. Load all capture models for this canvas on this site.
  const models = await userApi.getAllCaptureModels({
    target_type: 'Canvas',
    target_id: `urn:madoc:canvas:${canvasId}`,
    all_derivatives: true,
  });

  // 2. Load all linking properties to find capture model partials
  const linking = await userApi.getCanvasLinking(canvasId);

  // 3. For each of the models, check if any of capture models have been used
  const paragraphs: Array<ParagraphEntity> = []; // We are only checking the FIRST model.
  let modelId: string | undefined = undefined;

  for (const modelRef of models) {
    const fullModel = await userApi.getCaptureModel(modelRef.id);
    traverseDocument(fullModel.document, {
      beforeVisitEntity(entity) {
        if (isParagraphEntity(entity)) {
          paragraphs.push(entity);
        }
      },
      visitEntity(entity, key, parent) {
        if (isParagraphEntity(entity)) {
          if (parent && key) {
            // Remove property so that it is not indexed in normal model.
            delete parent.properties[key];
          }
        }
      },
    });

    if (paragraphs.length) {
      // We have models!
      modelId = fullModel.id;
      break;
    }
  }

  if (paragraphs.length === 0) {
    // We need to check to see if we have one in the linking.
    const foundLinking = linking.linking.find(singleLink => {
      return (
        singleLink.property === 'seeAlso' &&
        singleLink.link.type === 'CaptureModelDocument' &&
        singleLink.link.profile === PARAGRAPHS_PROFILE
      );
    });

    if (foundLinking) {
      const data = foundLinking.file
        ? await userApi.getStorageJsonData(foundLinking.file.bucket, foundLinking.file.path)
        : await fetch(foundLinking.link.id).then(r => r.json());

      if (data && data.paragraph && data.paragraph.length) {
        modelId = `urn:madoc:file:${foundLinking.id}`;
        data.paragraph.forEach((paragraph: any) => {
          paragraphs.push(paragraph);
        });
      }
    }
  }

  // 5. Index remaining Capture models
  if (paragraphs.length !== 0 && modelId) {
    // We have models!
    const resource: { [term: string]: Array<BaseField> | Array<Document> } = {
      paragraph: paragraphs as any,
    };
    try {
      const resp = await userApi.indexCaptureModel(modelId, `urn:madoc:canvas:${canvasId}`, resource);
      console.log(resp);
    } catch (err) {
      console.log(err);
    }
  }

  // 6. Index any remaining capture model partials

  context.response.body = canvas;
};
