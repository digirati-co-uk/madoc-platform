import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { RouteMiddleware } from '../../types/route-middleware';
import { SearchIndexable, captureModelToIndexables } from '../../utility/capture-model-to-indexables';
import {
  getTypesenseIndexablesCollectionName,
  isTypesenseSearchEnabled,
  TypesenseClient,
} from '../../search/typesense/typesense-client';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { buildTypesenseIndexableDocument } from '../../search/typesense/build-search-documents';

type ModelIngestRequest = {
  resource_id: string;
  content_id: string;
  resource: CaptureModel | CaptureModel['document'] | { [term: string]: any[] };
};

function noTypesenseResponse(context: any) {
  context.response.status = 503;
  context.response.body = {
    error: 'Typesense search is not enabled',
  };
}

function extractIndexablesFromModel(request: ModelIngestRequest): SearchIndexable[] {
  const resource = request.resource as any;

  try {
    if (resource && resource.document) {
      return captureModelToIndexables(request.resource_id, resource.document);
    }

    if (resource && resource.type === 'entity' && resource.properties) {
      return captureModelToIndexables(request.resource_id, resource);
    }

    if (resource && typeof resource === 'object') {
      const syntheticDocument: CaptureModel['document'] = {
        id: request.content_id || `${request.resource_id}-synthetic`,
        type: 'entity',
        properties: resource,
      };
      return captureModelToIndexables(request.resource_id, syntheticDocument);
    }
  } catch (err) {
    return [];
  }

  return [];
}

async function listIndexablesForRequest(context: any, collectionName: string) {
  const typesense = new TypesenseClient();
  const iiifMadocId = context.query.iiif__madoc_id;
  const filterBy = iiifMadocId ? `resource_id:=${`\`${iiifMadocId}\``}` : undefined;
  const result = (await typesense.search(collectionName, {
    q: '*',
    query_by: 'indexable,resource_id,type,subtype',
    page: Number(context.query.page) || 1,
    per_page: Number(context.query.per_page) || 250,
    filter_by: filterBy,
  })) as any;

  return {
    results: (result.hits || []).map((hit: any) => hit.document),
    total: result.found || 0,
  };
}

export const typesenseIndexRawIndexable: RouteMiddleware<{}, SearchIndexable> = async context => {
  if (!isTypesenseSearchEnabled()) {
    noTypesenseResponse(context);
    return;
  }

  const { siteId } = optionalUserWithScope(context, []);
  const collectionName = getTypesenseIndexablesCollectionName(siteId);
  const typesense = new TypesenseClient();
  await typesense.ensureIndexablesCollection(collectionName);

  const document = buildTypesenseIndexableDocument(siteId, context.requestBody, 0);
  const importResult = await typesense.upsertDocuments(collectionName, [document]);

  context.response.body = {
    indexed: importResult.total,
    id: document.id,
  };
};

export const typesenseIngestModelIndexables: RouteMiddleware<{}, ModelIngestRequest> = async context => {
  if (!isTypesenseSearchEnabled()) {
    noTypesenseResponse(context);
    return;
  }

  const { siteId } = optionalUserWithScope(context, []);
  const collectionName = getTypesenseIndexablesCollectionName(siteId);
  const typesense = new TypesenseClient();
  await typesense.ensureIndexablesCollection(collectionName);

  const indexables = extractIndexablesFromModel(context.requestBody);
  const documents = indexables.map((indexable, index) => buildTypesenseIndexableDocument(siteId, indexable, index));
  const importResult = await typesense.upsertDocuments(collectionName, documents);

  context.response.body = {
    indexed: importResult.total,
    source: context.requestBody.resource_id,
  };
};

export const typesenseListIndexables: RouteMiddleware = async context => {
  if (!isTypesenseSearchEnabled()) {
    noTypesenseResponse(context);
    return;
  }

  const { siteId } = optionalUserWithScope(context, []);
  const collectionName = getTypesenseIndexablesCollectionName(siteId);
  const typesense = new TypesenseClient();
  await typesense.ensureIndexablesCollection(collectionName);
  context.response.body = await listIndexablesForRequest(context, collectionName);
};

export const typesenseGetIndexable: RouteMiddleware<{ id: string }> = async context => {
  if (!isTypesenseSearchEnabled()) {
    noTypesenseResponse(context);
    return;
  }

  const { siteId } = optionalUserWithScope(context, []);
  const collectionName = getTypesenseIndexablesCollectionName(siteId);
  const typesense = new TypesenseClient();
  await typesense.ensureIndexablesCollection(collectionName);
  const document = await typesense.getDocument(collectionName, context.params.id, { allow404: true });

  if (!document) {
    context.response.status = 404;
    context.response.body = { error: 'Not found' };
    return;
  }

  context.response.body = document;
};

export const typesenseListModels: RouteMiddleware = async context => {
  if (!isTypesenseSearchEnabled()) {
    noTypesenseResponse(context);
    return;
  }

  const { siteId } = optionalUserWithScope(context, []);
  const collectionName = getTypesenseIndexablesCollectionName(siteId);
  const typesense = new TypesenseClient();
  await typesense.ensureIndexablesCollection(collectionName);
  context.response.body = await listIndexablesForRequest(context, collectionName);
};

export const typesenseGetModel: RouteMiddleware<{ id: string }> = async context => {
  if (!isTypesenseSearchEnabled()) {
    noTypesenseResponse(context);
    return;
  }

  const { siteId } = optionalUserWithScope(context, []);
  const collectionName = getTypesenseIndexablesCollectionName(siteId);
  const typesense = new TypesenseClient();
  await typesense.ensureIndexablesCollection(collectionName);
  const document = await typesense.getDocument(collectionName, context.params.id, { allow404: true });

  if (!document) {
    context.response.status = 404;
    context.response.body = { error: 'Not found' };
    return;
  }

  context.response.body = document;
};
