import { sql } from 'slonik';
import {
  isParagraphEntity,
  ParagraphEntity,
  PARAGRAPHS_PROFILE,
} from '../../extensions/capture-models/Paragraphs/Paragraphs.helpers';
import { traverseDocument } from '../../frontend/shared/capture-models/helpers/traverse-document';
import { BaseField } from '../../frontend/shared/capture-models/types/field-types';
import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { SearchIngestRequest } from '../../types/search';
import { captureModelToIndexables, SearchIndexable } from '../../utility/capture-model-to-indexables';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { getParentResources } from '../../database/queries/resource-queries';

export const indexCanvas: RouteMiddleware<{ id: string }> = async context => {
  const { siteId, siteUrn } = optionalUserWithScope(context, []);
  const userApi = api.asUser({ siteId });
  const canvasId = Number(context.params.id);

  const { canvas } = await userApi.getCanvasById(canvasId);
  const sourceId = `http://madoc.dev/urn:madoc:canvas:${canvasId}`;

  const manifestsWithin = await context.connection.any(getParentResources(canvasId as any, siteId));
  const projectsWithin = manifestsWithin.length
    ? await context.connection.any<{ id: number }>(
        sql`select ip.id from iiif_derived_resource_items cols
        left join iiif_derived_resource ir on ir.resource_id = cols.resource_id
        left join iiif_project ip on ip.collection_id = ir.resource_id
        where item_id = ANY (${sql.array(
          manifestsWithin.map(r => r.resource_id),
          sql`int[]`
        )}) and cols.site_id = ${Number(siteId)} and ir.flat = true`
      )
    : [];

  const collectionsWithin = manifestsWithin.length
    ? await context.connection.any<{ resource_id: number }>(
        sql`select cols.resource_id from iiif_derived_resource_items cols
        left join iiif_derived_resource ir on ir.resource_id = cols.resource_id
        where item_id = ANY (${sql.array(
          manifestsWithin.map(r => r.resource_id),
          sql`int[]`
        )}) and cols.site_id = ${Number(siteId)} and ir.flat = false`
      )
    : [];

  const searchPayload: SearchIngestRequest = {
    id: `urn:madoc:canvas:${canvasId}`,
    type: 'Canvas',
    cascade: false,
    cascade_canvases: false,
    resource: {
      type: 'Canvas',
      id: sourceId,
      label: canvas.label as any,
      thumbnail: canvas.thumbnail ? (canvas.thumbnail[0].id as any) : null,
      summary: canvas.summary,
      metadata: canvas.metadata,
      rights: (canvas as any).rights,
      provider: (canvas as any).provider,
      requiredStatement: canvas.requiredStatement,
      navDate: (canvas as any).navDate,
    },
    thumbnail: canvas.thumbnail ? (canvas.thumbnail[0].id as any) : null,
    contexts: [
      { id: siteUrn, type: 'Site' },
      ...projectsWithin.map(({ id }) => {
        return { id: `urn:madoc:project:${id}`, type: 'Project' };
      }),
      ...collectionsWithin.map(({ resource_id }) => {
        return { id: `urn:madoc:collection:${resource_id}`, type: 'Collection' };
      }),
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
  const fullModels = [];

  for (const modelRef of models) {
    const fullModel = await userApi.getCaptureModel(modelRef.id, { published: true });
    // Push for indexing.
    fullModels.push(fullModel);

    // Check if we need to load paragraphs from linked properties.
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

      if (data.paragraphs && data.paragraph.length) {
        data.paragraph = data.paragraphs;
        delete data.paragraphs;
      }
      if (data && data.paragraph && data.paragraph.length) {
        modelId = `urn:madoc:file:${foundLinking.id}`;
        data.paragraph.forEach((paragraph: any) => {
          paragraphs.push(paragraph);
        });
      }
    }
  }

  // 5. Index remaining Capture models - ONLY When we don't have paragraphs.
  if (paragraphs.length !== 0 && modelId) {
    // We have models!
    const resource: { [term: string]: Array<BaseField> | Array<Document> } = {
      paragraph: paragraphs as any,
    };
    try {
      await userApi.indexCaptureModel(modelId, `urn:madoc:canvas:${canvasId}`, resource);
    } catch (err) {
      // no-op
    }
  }

  // 5. Index remaining Capture models
  if (models.length) {
    const indexables: SearchIndexable[] = [];
    for (const model of fullModels) {
      try {
        // Delete paragraph field if it exists, it should already be indexed.
        delete model.document.properties.paragraph;
        // And then push the rest of the indexables.
        indexables.push(...captureModelToIndexables(`urn:madoc:canvas:${canvasId}`, model.document));
      } catch (err) {
        // No-op.
      }
    }

    if (indexables.length) {
      for (const indexable of indexables) {
        try {
          await userApi.indexRawSearchIndexable(indexable);
        } catch (err) {
          // no-op
        }
      }
    }
  }

  // 6. Index any remaining capture model partials
  // @todo - this is not yet used.

  context.response.body = canvas;
};
