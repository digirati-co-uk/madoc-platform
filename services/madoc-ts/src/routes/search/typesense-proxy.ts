import {
  getTypesenseProjectSearchCollectionName,
  isTypesenseAvailable,
  resolveTypesenseSearchCollection,
  type TypesenseAvailability,
  TypesenseClient,
} from '../../search/typesense/typesense-client';
import { getProjectSearchIndexConfiguration } from '../../search/project-search-index-configuration';
import { api } from '../../gateway/api.server';
import type { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { onlyPublishedProjects, optionalUserWithScope } from '../../utility/user-with-scope';

function sanitizeSearchParams(input: Record<string, any> | string) {
  const scoped: Record<string, any> = {};

  const mergeEntry = (key: string, value: any) => {
    if (
      key === 'collection' ||
      key === 'index' ||
      key === 'indexName' ||
      key === 'x-typesense-api-key' ||
      key === 'params'
    ) {
      return;
    }
    if (typeof value === 'undefined' || value === null || value === '') {
      return;
    }
    scoped[key] = Array.isArray(value) ? value.join(',') : value;
  };

  const parsedInput =
    typeof input === 'string'
      ? (() => {
          try {
            return JSON.parse(input);
          } catch {
            return {
              params: input,
            };
          }
        })()
      : input;

  for (const [key, value] of Object.entries(parsedInput || {})) {
    const resolvedValue = Array.isArray(value) ? value[0] : value;

    if (key === 'params') {
      if (typeof resolvedValue === 'string') {
        const embeddedParams = new URLSearchParams(
          resolvedValue.startsWith('?') ? resolvedValue.slice(1) : resolvedValue
        );
        for (const [embeddedKey, embeddedValue] of embeddedParams.entries()) {
          mergeEntry(embeddedKey, embeddedValue);
        }
      }
      if (resolvedValue && typeof resolvedValue === 'object') {
        for (const [embeddedKey, embeddedValue] of Object.entries(resolvedValue)) {
          mergeEntry(embeddedKey, embeddedValue);
        }
      }
      continue;
    }

    mergeEntry(key, resolvedValue);
  }

  if (!scoped.q) {
    scoped.q = '*';
  }
  if (!scoped.query_by) {
    scoped.query_by = 'resource_label,search_text,search_context';
  }

  return scoped;
}

function parseRequestPayload(input: any): Record<string, any> {
  if (!input) {
    return {};
  }

  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  return typeof input === 'object' ? input : {};
}

function unavailableResponse({
  context,
  availability,
  collection,
}: {
  context: any;
  availability: TypesenseAvailability;
  collection: string;
}) {
  context.response.status = 503;
  context.response.body = {
    error: 'Typesense search is unavailable',
    available: false,
    collection,
    reason: availability.reason || 'Typesense service is unavailable',
  };
}

async function getTypesenseContext(context: any) {
  let siteId: number;
  if (context.params?.slug) {
    const site = await context.siteManager.getSiteBySlug(context.params.slug);
    if (!site) {
      throw new NotFound('not found');
    }
    siteId = site.id;
  } else {
    const scoped = optionalUserWithScope(context, []);
    siteId = scoped.siteId;
  }

  const collection = resolveTypesenseSearchCollection({ siteId });
  const availability = await isTypesenseAvailable();
  return {
    siteId,
    collection,
    availability,
  };
}

export const typesenseProxyStatus: RouteMiddleware = async context => {
  const { collection, availability } = await getTypesenseContext(context);

  context.response.body = {
    available: availability.available,
    collection,
    reason: availability.reason,
  };
};

export const typesenseProxySearch: RouteMiddleware = async context => {
  const { collection, availability } = await getTypesenseContext(context);

  if (!availability.available) {
    unavailableResponse({ context, availability, collection });
    return;
  }

  const typesense = new TypesenseClient();
  await typesense.ensureSearchCollection(collection);

  const input = context.method === 'GET' ? context.query : parseRequestPayload(context.requestBody);
  if (context.params?.collection) {
    input.collection = context.params.collection;
  }
  const params = sanitizeSearchParams(input);

  context.response.body = await typesense.searchRaw(collection, params);
};

export const typesenseProxyMultiSearch: RouteMiddleware = async context => {
  const { collection, availability } = await getTypesenseContext(context);

  if (!availability.available) {
    unavailableResponse({ context, availability, collection });
    return;
  }

  const payload = parseRequestPayload(context.requestBody);
  const searches = Array.isArray(payload.searches)
    ? payload.searches
    : typeof payload.searches === 'string'
      ? (() => {
          try {
            const parsed = JSON.parse(payload.searches);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : [];
  if (!searches.length) {
    context.response.status = 400;
    context.response.body = {
      error: 'Invalid Typesense multi_search payload. Expected a non-empty searches array.',
    };
    return;
  }
  const scopedSearches = searches.map(search => {
    const scopedSearch = sanitizeSearchParams(search || {});
    return {
      ...scopedSearch,
      collection,
    };
  });

  const typesense = new TypesenseClient();
  await typesense.ensureSearchCollection(collection);
  const requestPayload: Record<string, any> = {
    searches: scopedSearches,
  };
  if (typeof payload.union !== 'undefined') {
    requestPayload.union = payload.union;
  }
  context.response.body = await typesense.multiSearch(requestPayload);
};

async function getProjectTypesenseContext(context: any) {
  const site = await context.siteManager.getSiteBySlug(context.params.slug);
  if (!site) throw new NotFound('Site not found');
  const project = await context.projects.getProjectByIdOrSlug(
    context.params.project,
    site.id,
    onlyPublishedProjects(context.state.jwt?.scope)
  );
  const siteApi = api.asUser({ siteId: site.id }, { siteSlug: site.slug });
  context.disposableApis.push(siteApi);
  const { config } = await getProjectSearchIndexConfiguration(siteApi, site.id, project.id);
  const definition = config.indexes.find(
    index => index.id === context.params.indexId && index.enabled && index.lastIndexedAt
  );
  if (!definition) throw new NotFound('Search index not found');
  return {
    collection: getTypesenseProjectSearchCollectionName(site.id, project.id, definition.id),
    availability: await isTypesenseAvailable(),
  };
}

export const typesenseProjectProxyStatus: RouteMiddleware = async context => {
  const { collection, availability } = await getProjectTypesenseContext(context);
  context.response.body = { available: availability.available, collection, reason: availability.reason };
};

export const typesenseProjectProxySearch: RouteMiddleware = async context => {
  const { collection, availability } = await getProjectTypesenseContext(context);
  if (!availability.available) {
    unavailableResponse({ context, availability, collection });
    return;
  }
  const input = context.method === 'GET' ? context.query : parseRequestPayload(context.requestBody);
  const params = sanitizeSearchParams(input);
  params.query_by = 'resource_label,search_text';
  const typesense = new TypesenseClient();
  await typesense.ensureProjectSearchCollection(collection);
  context.response.body = await typesense.searchRaw(collection, params);
};

export const typesenseProjectProxyMultiSearch: RouteMiddleware = async context => {
  const { collection, availability } = await getProjectTypesenseContext(context);
  if (!availability.available) {
    unavailableResponse({ context, availability, collection });
    return;
  }
  const payload = parseRequestPayload(context.requestBody);
  const searches = Array.isArray(payload.searches) ? payload.searches : [];
  if (!searches.length) {
    context.response.status = 400;
    context.response.body = { error: 'Invalid Typesense multi_search payload. Expected a non-empty searches array.' };
    return;
  }
  const typesense = new TypesenseClient();
  await typesense.ensureProjectSearchCollection(collection);
  context.response.body = await typesense.multiSearch({
    searches: searches.map(search => ({
      ...sanitizeSearchParams(search || {}),
      query_by: 'resource_label,search_text',
      collection,
    })),
  });
};
