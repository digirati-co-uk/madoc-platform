import { sql } from 'slonik';
import {
  isParagraphEntity,
  ParagraphEntity,
  PARAGRAPHS_PROFILE,
} from '../../extensions/capture-models/Paragraphs/Paragraphs.helpers';
import { traverseDocument } from '../../frontend/shared/capture-models/helpers/traverse-document';
import { BaseField } from '../../frontend/shared/capture-models/types/field-types';
import { api } from '../../gateway/api.server';
import { buildTypesenseDocumentFromIngest } from '../../search/typesense/build-search-documents';
import {
  isTypesenseAvailable,
  isTypesenseSearchEnabled,
  resolveTypesenseSearchCollection,
  TypesenseClient,
} from '../../search/typesense/typesense-client';
import { RouteMiddleware } from '../../types/route-middleware';
import { SearchIngestRequest } from '../../types/search';
import { captureModelToIndexables, SearchIndexable } from '../../utility/capture-model-to-indexables';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { getParentResources } from '../../database/queries/resource-queries';

function getErrorMessage(err: unknown) {
  if (err instanceof Error) {
    return err.message;
  }
  return 'Unknown error';
}

function uniq(values: string[]) {
  return [...new Set(values.map(value => value.trim()).filter(Boolean))];
}

function toCaptureModelFieldName(modelId: string): string | null {
  const lastToken = `${modelId}`.split(':').pop() || `${modelId}`;
  const normalized = lastToken
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!normalized) {
    return null;
  }

  return `capture_model_${normalized}`;
}

function collectSearchableValues(value: unknown, values: string[]) {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed !== trimmed) {
        collectSearchableValues(parsed, values);
        return;
      }
    } catch {
      // no-op.
    }
    values.push(trimmed);
    return;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    values.push(`${value}`);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectSearchableValues(item, values);
    }
    return;
  }

  if (value && typeof value === 'object') {
    for (const nestedValue of Object.values(value)) {
      collectSearchableValues(nestedValue, values);
    }
  }
}

function appendCaptureModelValues(
  modelValues: Record<string, string[]>,
  modelId: string | undefined,
  values: string[],
  searchTextValues: string[]
) {
  if (!modelId) {
    return;
  }

  const fieldName = toCaptureModelFieldName(modelId);
  const uniqueValues = uniq(values);

  if (!fieldName || !uniqueValues.length) {
    return;
  }

  modelValues[fieldName] = uniq([...(modelValues[fieldName] || []), ...uniqueValues]);
  searchTextValues.push(...uniqueValues);
}

export const indexCanvas: RouteMiddleware<{ id: string }> = async context => {
  const { siteId, siteUrn } = optionalUserWithScope(context, []);
  const siteIdAsNumber = Number(siteId);
  const userApi = api.asUser({ siteId });
  const canvasId = Number(context.params.id);
  const site = await context.siteManager.getSiteById(siteId);
  const forceIndex = context.query.force === 'true';

  if (site.config.disableSearchIndexing && !forceIndex) {
    console.log('Search: indexing skipped, Canvas(%d) Site(%d)', canvasId, siteId);
    context.response.body = { noSearch: true };
    return;
  }

  const { canvas } = await userApi.getCanvasById(canvasId);
  const sourceId = `http://madoc.dev/urn:madoc:canvas:${canvasId}`;
  const canvasUrn = `urn:madoc:canvas:${canvasId}`;

  const manifestsWithin = await context.connection.any(getParentResources(canvasId as any, siteId));
  const publishedManifestIds = manifestsWithin.length
    ? await context.connection.any<{ resource_id: number }>(
        sql`select resource_id from iiif_derived_resource
            where site_id = ${siteIdAsNumber}
              and resource_type = 'manifest'
              and published = true
              and resource_id = ANY (${sql.array(
                manifestsWithin.map(row => row.resource_id),
                sql`int[]`
              )})`
      )
    : [];
  const publishedManifestIdSet = new Set(publishedManifestIds.map(({ resource_id }) => resource_id));
  const publishedManifestsWithin = manifestsWithin.filter(row => publishedManifestIdSet.has(row.resource_id));

  if (!publishedManifestsWithin.length) {
    const warnings: string[] = [];

    let legacyCleanup: any = null;
    try {
      await userApi.searchDeleteIIIF(canvasUrn);
      legacyCleanup = {
        deleted: 1,
      };
    } catch (err) {
      warnings.push(`Legacy cleanup failed: ${getErrorMessage(err)}`);
    }

    let typesenseCleanup: any = null;
    if (isTypesenseSearchEnabled()) {
      const availability = await isTypesenseAvailable();
      if (availability.available) {
        try {
          const collectionName = resolveTypesenseSearchCollection({
            siteId: siteIdAsNumber,
          });
          const typesense = new TypesenseClient();
          await typesense.deleteDocument(collectionName, `${canvasUrn}:site:${siteIdAsNumber}`, { allow404: true });
          typesenseCleanup = {
            deleted: 1,
            collection: collectionName,
          };
        } catch (err) {
          warnings.push(`Typesense cleanup failed: ${getErrorMessage(err)}`);
        }
      } else {
        warnings.push(availability.reason || 'Typesense is unavailable');
      }
    }

    context.response.body = {
      noSearch: true,
      reason: 'Canvas is not in a published manifest',
      cleanup: {
        legacy: legacyCleanup,
        typesense: typesenseCleanup,
      },
      warnings,
    };
    return;
  }

  const projectsWithin = publishedManifestsWithin.length
    ? await context.connection.any<{ id: number }>(
        sql`select ip.id from iiif_derived_resource_items cols
        left join iiif_derived_resource ir on ir.resource_id = cols.resource_id
        left join iiif_project ip on ip.collection_id = ir.resource_id
        where item_id = ANY (${sql.array(
          publishedManifestsWithin.map(r => r.resource_id),
          sql`int[]`
        )}) and cols.site_id = ${siteIdAsNumber} and ir.flat = true`
      )
    : [];

  const collectionsWithin = publishedManifestsWithin.length
    ? await context.connection.any<{ resource_id: number }>(
        sql`select cols.resource_id from iiif_derived_resource_items cols
        left join iiif_derived_resource ir on ir.resource_id = cols.resource_id
        where item_id = ANY (${sql.array(
          publishedManifestsWithin.map(r => r.resource_id),
          sql`int[]`
        )}) and cols.site_id = ${siteIdAsNumber} and ir.flat = false`
      )
    : [];

  const searchPayload: SearchIngestRequest = {
    id: canvasUrn,
    type: 'Canvas',
    cascade: false,
    cascade_canvases: false,
    resource: {
      type: 'Canvas',
      id: sourceId,
      label: canvas.label as any,
      thumbnail: canvas.thumbnail ? (canvas.thumbnail[0].id as any) : (canvas as any).placeholder_image || null,
      summary: canvas.summary,
      metadata: canvas.metadata,
      rights: (canvas as any).rights,
      provider: (canvas as any).provider,
      requiredStatement: canvas.requiredStatement,
      navDate: (canvas as any).navDate,
    },
    thumbnail: canvas.thumbnail ? (canvas.thumbnail[0].id as any) : (canvas as any).placeholder_image || null,
    contexts: [
      { id: siteUrn, type: 'Site' },
      ...projectsWithin.map(({ id }) => {
        return { id: `urn:madoc:project:${id}`, type: 'Project' };
      }),
      ...collectionsWithin.map(({ resource_id }) => {
        return { id: `urn:madoc:collection:${resource_id}`, type: 'Collection' };
      }),
      // Should this be contexts or manifests here? Do canvases have site contexts too?
      ...publishedManifestsWithin.map(({ resource_id }) => {
        return { id: `urn:madoc:manifest:${resource_id}`, type: 'Manifest' };
      }),
      {
        id: canvasUrn,
        type: 'Canvas',
      },
    ],
  };

  const legacyIndexingDisabled = isTypesenseSearchEnabled();
  let legacyResult: any = {
    skipped: true,
    reason: 'Legacy search indexing is disabled while Typesense indexing is enabled',
  };

  if (!legacyIndexingDisabled) {
    try {
      await api.searchGetIIIF(canvasUrn);
      legacyResult = await userApi.searchReIngest(searchPayload);
    } catch (err) {
      legacyResult = await userApi.searchIngest(searchPayload);
    }
  }

  const warnings: string[] = [];
  let typesenseResult: any = null;
  const availability = await isTypesenseAvailable();
  const captureModelValues: Record<string, string[]> = {};
  const captureModelSearchText: string[] = [];
  const shouldProcessCaptureModels = !legacyIndexingDisabled || availability.available;

  if (shouldProcessCaptureModels) {
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

        if (data.paragraphs && data.paragraphs.length) {
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
      const paragraphText: string[] = [];
      for (const paragraph of paragraphs) {
        collectSearchableValues(paragraph, paragraphText);
      }
      appendCaptureModelValues(captureModelValues, modelId, paragraphText, captureModelSearchText);

      if (!legacyIndexingDisabled) {
        try {
          await userApi.indexCaptureModel(modelId, `urn:madoc:canvas:${canvasId}`, resource);
        } catch (err) {
          // no-op
        }
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
          const modelIndexables = captureModelToIndexables(`urn:madoc:canvas:${canvasId}`, model.document);
          indexables.push(...modelIndexables);

          const modelText: string[] = [];
          for (const indexable of modelIndexables) {
            collectSearchableValues(indexable.indexable, modelText);
          }
          appendCaptureModelValues(captureModelValues, model.id, modelText, captureModelSearchText);
        } catch (err) {
          // No-op.
        }
      }

      if (!legacyIndexingDisabled && indexables.length) {
        for (const indexable of indexables) {
          try {
            await userApi.indexRawSearchIndexable(indexable);
          } catch (err) {
            // no-op
          }
        }
      }
    }
  }

  if (availability.available) {
    try {
      const collectionName = resolveTypesenseSearchCollection({
        siteId: siteIdAsNumber,
      });
      const typesenseDocument = buildTypesenseDocumentFromIngest({
        siteId: siteIdAsNumber,
        request: searchPayload,
        captureModelValues,
        additionalSearchText: uniq(captureModelSearchText),
      });
      const typesense = new TypesenseClient();
      await typesense.ensureSearchCollection(collectionName);
      const importResult = await typesense.upsertDocuments(collectionName, [typesenseDocument]);

      typesenseResult = {
        indexed: importResult.total,
        collection: collectionName,
        importResult,
      };
    } catch (err) {
      warnings.push(`Typesense indexing failed: ${getErrorMessage(err)}`);
    }
  } else if (isTypesenseSearchEnabled()) {
    warnings.push(availability.reason || 'Typesense is unavailable');
  }

  // 6. Index any remaining capture model partials
  // @todo - this is not yet used.

  context.response.body = {
    canvas,
    legacy: legacyResult,
    typesense: typesenseResult,
    warnings,
  };
};
