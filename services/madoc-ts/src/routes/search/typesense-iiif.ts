import { RouteMiddleware } from '../../types/route-middleware';
import { SearchIngestRequest } from '../../types/search';
import {
  getTypesenseSiteCollectionName,
  isTypesenseSearchEnabled,
  TypesenseClient,
} from '../../search/typesense/typesense-client';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { buildTypesenseDocumentFromIngest } from '../../search/typesense/build-search-documents';

function noTypesenseResponse(context: any) {
  context.response.status = 503;
  context.response.body = {
    error: 'Typesense search is not enabled',
  };
}

export const typesenseIngestIIIF: RouteMiddleware<{}, SearchIngestRequest> = async context => {
  if (!isTypesenseSearchEnabled()) {
    noTypesenseResponse(context);
    return;
  }

  const { siteId } = optionalUserWithScope(context, []);
  const request = context.requestBody;
  const collectionName = getTypesenseSiteCollectionName(siteId);
  const typesense = new TypesenseClient();

  await typesense.ensureSearchCollection(collectionName);
  const document = buildTypesenseDocumentFromIngest({ siteId, request });
  const importResult = await typesense.upsertDocuments(collectionName, [document]);

  context.response.body = {
    madoc_id: request.id,
    indexed: importResult.total,
  };
};

export const typesenseListIIIF: RouteMiddleware = async context => {
  if (!isTypesenseSearchEnabled()) {
    noTypesenseResponse(context);
    return;
  }

  const { siteId } = optionalUserWithScope(context, []);
  const collectionName = getTypesenseSiteCollectionName(siteId);
  const typesense = new TypesenseClient();
  await typesense.ensureSearchCollection(collectionName);

  const result = (await typesense.search(collectionName, {
    q: '*',
    query_by: 'resource_id,resource_label,search_text',
    page: Number(context.query.page) || 1,
    per_page: Number(context.query.per_page) || 100,
  })) as any;

  context.response.body = {
    results: (result.hits || []).map((hit: any) => ({
      madoc_id: hit.document.resource_id,
      ...hit.document,
    })),
    total: result.found || 0,
  };
};

export const typesenseGetIIIF: RouteMiddleware<{ id: string }> = async context => {
  if (!isTypesenseSearchEnabled()) {
    noTypesenseResponse(context);
    return;
  }

  const { siteId } = optionalUserWithScope(context, []);
  const resourceId = context.params.id;
  const collectionName = getTypesenseSiteCollectionName(siteId);
  const typesense = new TypesenseClient();
  await typesense.ensureSearchCollection(collectionName);

  const id = `${resourceId}:site:${siteId}`;
  const document = (await typesense.getDocument(collectionName, id, { allow404: true })) as any;

  if (!document) {
    context.response.status = 404;
    context.response.body = { error: 'Not found' };
    return;
  }

  context.response.body = {
    madoc_id: resourceId,
    ...document,
  };
};

export const typesenseDeleteIIIF: RouteMiddleware<{ id: string }> = async context => {
  if (!isTypesenseSearchEnabled()) {
    noTypesenseResponse(context);
    return;
  }

  const { siteId } = optionalUserWithScope(context, []);
  const resourceId = context.params.id;
  const collectionName = getTypesenseSiteCollectionName(siteId);
  const typesense = new TypesenseClient();
  await typesense.ensureSearchCollection(collectionName);
  await typesense.deleteDocument(collectionName, `${resourceId}:site:${siteId}`, { allow404: true });

  context.response.body = {
    deleted: true,
    madoc_id: resourceId,
  };
};
