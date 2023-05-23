import { BaseDjangoExtension } from '../base-django-extension';
import { ResourceRelationship } from './types';
import * as T from './types';
import { SearchIngestRequest, SearchQuery, SearchResponse } from '../../../types/search';
import { SearchIndexTask } from '../../../gateway/tasks/search-index-task';
import { EnrichmentIndexPayload } from '../types';
import { SearchIndexable } from '../../../utility/capture-model-to-indexables';

export class SearchExtension extends BaseDjangoExtension {
  // /api/search_service/content_type/
  // /api/search_service/content_type/<id>/
  // /api/search_service/context/
  // /api/search_service/context/<urn>/
  // /api/search_service/indexable/
  // /api/search_service/indexable/<id>/
  // @todo /api/search_service/indexable_search/
  // /api/search_service/json_resource/
  // /api/search_service/json_resource/<id>/
  // @todo /api/search_service/json_resource/create_nested/
  // @todo /api/search_service/json_resource_search/
  // /api/search_service/resource_relationship/
  // /api/search_service/resource_relationship/<id>/

  // NEW SEARCH API.
  async enrichmentIngestResource(request: EnrichmentIndexPayload) {
    return this.api.request(`/api/enrichment/resource/`, {
      method: 'POST',
      body: request,
    });
  }
  async searchQuery(query: SearchQuery, page = 1, madoc_id?: string) {
    return this.api.request<SearchResponse>(`/api/enrichment/search/`, {
      method: 'POST',
      body: {
        ...query,
        page,
        madoc_id,
      },
    });
  }
  async triggerSearchIndex(id: number, type: string) {
    return this.api.request(`/api/enrichment/internal/madoc/tasks/index_madoc_resource/`, {
      method: 'POST',
      body: {
        task: {
          subject: `urn:madoc:${type}:${id}`,
          parameters: [{}],
        },
      },
    });
  }
  async searchGetIIIF(id: string) {
    try {
      return this.api.request(`/api/enrichment/internal/madoc/resource/${id}/`);
    } catch (err) {
      return undefined;
    }
  }
  async searchDeleteIIIF(id: string) {
    try {
      return this.api.request(`/api/enrichment/internal/madoc/resource/${id}/`, {
        method: 'DELETE',
      });
    } catch (err) {
      return undefined;
    }
  }
  async searchReIngest(resource: SearchIngestRequest) {
    return this.api.request<SearchIndexTask>(`/api/enrichment/internal/madoc/resource/${resource.id}`, {
      method: 'PUT',
      body: resource,
    });
  }

  async batchSearchIngestManifestCanvases(manifestId: number, canvasesToAdd: number[], canvasesToRemove: number[]) {
    const manifest = `urn:madoc:manifest:${manifestId}`;
    const toAdd = canvasesToAdd.map(c => `urn:madoc:canvas:${c}`);
    const toRemove = canvasesToRemove.map(c => `urn:madoc:canvas:${c}`);

    if (toAdd.length === 0 && toRemove.length === 0) {
      return null;
    }

    const body: any = {};
    if (toAdd.length) {
      body.add = [{ source: manifest, targets: toAdd, type: 'hasCanvas' }];
    }
    if (toRemove.length) {
      body.remove = [{ source: manifest, targets: toRemove, type: 'hasCanvas' }];
    }

    return this.api.request(`/api/enrichment/relationship/batch/`, {
      method: 'POST',
      body,
    });
  }

  // This is very internal.
  // content_type = this.createServiceHelper('search_service', 'content_type');
  context = this.createPaginatedServiceHelper<T.SearchContext>('search_service', 'context');
  indexable = this.createPaginatedServiceHelper<SearchIndexable>('search_service', 'indexable');
  // @todo unknown what this is.
  json_resource = this.createPaginatedServiceHelper<unknown>('search_service', 'json_resource');
  resource_relationship = this.createPaginatedServiceHelper<ResourceRelationship>(
    'search_service',
    'resource_relationship'
  );
}
