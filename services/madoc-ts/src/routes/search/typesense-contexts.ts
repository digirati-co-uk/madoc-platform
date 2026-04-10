import { RouteMiddleware } from '../../types/route-middleware';
import {
  getTypesenseSiteCollectionName,
  isTypesenseSearchEnabled,
  TypesenseClient,
} from '../../search/typesense/typesense-client';
import { optionalUserWithScope } from '../../utility/user-with-scope';

function noTypesenseResponse(context: any) {
  context.response.status = 503;
  context.response.body = {
    error: 'Typesense search is not enabled',
  };
}

export const typesenseListContexts: RouteMiddleware = async context => {
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
    query_by: 'resource_id',
    page: 1,
    per_page: 1,
    facet_by: 'contexts',
    max_facet_values: Number(context.query.max_facet_values) || 5000,
  })) as any;

  const contextsFacet = (result.facet_counts || []).find((facet: any) => facet.field_name === 'contexts');

  context.response.body = {
    results: (contextsFacet?.counts || []).map((facet: any) => ({
      id: facet.value,
      count: facet.count,
    })),
  };
};

export const typesenseGetContext: RouteMiddleware<{ id: string }> = async context => {
  if (!isTypesenseSearchEnabled()) {
    noTypesenseResponse(context);
    return;
  }

  const { siteId } = optionalUserWithScope(context, []);
  const collectionName = getTypesenseSiteCollectionName(siteId);
  const typesense = new TypesenseClient();
  await typesense.ensureSearchCollection(collectionName);
  const contextId = context.params.id;

  const result = (await typesense.search(collectionName, {
    q: '*',
    query_by: 'resource_id',
    page: Number(context.query.page) || 1,
    per_page: Number(context.query.per_page) || 50,
    filter_by: `contexts:=${`\`${contextId}\``}`,
  })) as any;

  context.response.body = {
    id: contextId,
    total: result.found || 0,
    results: (result.hits || []).map((hit: any) => hit.document),
  };
};
