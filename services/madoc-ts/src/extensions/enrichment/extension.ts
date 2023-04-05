import { Topic, TopicType, TopicTypeListResponse } from '../../types/schemas/topics';
import { BaseDjangoExtension } from './base-django-extension';
import { EnrichmentIndexPayload, EnrichmentPlaintext, EnrichmentTask } from './types';
import { ApiKey } from '../../types/api-key';
import { SearchQuery, SearchResponse } from '../../types/search';
import {
  EnrichmentEntityAutoCompleteResponse,
  EnrichmentResourceResponse,
  EntityMadocResponse,
  EntityTypeMadocResponse,
} from './authority/types';
import { stringify } from 'query-string';

export class EnrichmentExtension extends BaseDjangoExtension {
  // /api/madoc/indexable_data/
  // /api/madoc/indexable_data/<id>/
  // @todo /api/madoc/jwt/auth_detail/
  // /api/madoc/resource/
  // /api/madoc/resource/<madoc_id>/
  // /api/madoc/resource/add_manifest/ -- FETCH MORE
  // @todo /api/madoc/search/
  // @todo /api/madoc/tasks/
  // /api/madoc/tasks/index_all_madoc_resources/
  // /api/madoc/tasks/index_madoc_resource/
  // /api/madoc/tasks/madoc_manifest_enrichment_pipeline/
  // /api/madoc/tasks/madoc_resource_enrichment_pipeline/
  // /api/madoc/tasks/nlp_madoc_resource/
  // /api/madoc/tasks/ocr_madoc_resource/

  // @todo no idea what this is yet.
  indexable_data = this.createPaginatedServiceHelper<any>('madoc', 'indexable_data');
  resource = this.createPaginatedServiceHelper<EnrichmentIndexPayload>('madoc', 'resource');

  getServiceName(): string {
    return 'madoc';
  }

  // Site APIS.
  getSiteTopic(type: string, slug: string) {
    return this.api.publicRequest<Topic>(`/madoc/api/topics/${type}/${slug}`);
  }
  getSiteTopicTypes(page = 1) {
    return this.api.publicRequest<TopicTypeListResponse>(`/madoc/api/topics?page=${page}`);
  }
  getSiteTopicType(slug: string, page: number) {
    return this.api.publicRequest<TopicType>(`/madoc/api/topics/${slug}?page=${page}`);
  }

  getTopicType(id: string) {
    return this.api.request(`/api/enrichment/entity/${id}/`);
  }

  upsertTopicType(topicType: Partial<EntityTypeMadocResponse>) {
    return this.api.request<EntityTypeMadocResponse>(`/api/enrichment/entity_type/`, {
      method: 'POST',
      body: topicType,
    });
  }

  upsertTopic(topic: Partial<EntityMadocResponse>) {
    return this.api.request<EntityMadocResponse>(`/api/enrichment/entity/`, {
      method: 'POST',
      body: topic,
    });
  }
  getTopicItems(query: SearchQuery, page = 1, madoc_id?: string) {
    return this.api.request<SearchResponse>(`/madoc/api/search`, {
      method: 'POST',
      body: {
        ...query,
        page,
        madoc_id,
      },
    });
  }

  getAllEnrichmentTasks(page = 1) {
    return this.api.request(`/api/enrichment/task_log/?page=${page}`);
  }

  getEnrichmentTask(id: string) {
    return this.api.request<EnrichmentTask>(`/api/enrichment/task_log/${id}/`);
  }
  getEnrichmentPlaintext(id: string) {
    return this.api.request<EnrichmentPlaintext>(`/api/enrichment/plaintext/${id}/`);
  }

  enrichManifest(id: number) {
    return this.api.request<EnrichmentTask>(`/api/madoc/iiif/manifests/${id}/enrichment`, {
      method: 'POST',
    });
  }

  enrichManifestInternal(id: number, callback?: string) {
    return this.api.request<EnrichmentTask>(
      `/api/enrichment/internal/madoc/tasks/madoc_manifest_enrichment_pipeline/`,
      {
        method: 'POST',
        body: {
          task: {
            subject: `urn:madoc:manifest:${id}`,
            parameters: [{ callback_url: callback }],
          },
        },
      }
    );
  }

  allTasks = [
    // Authority service.
    {
      service: 'madoc',
      name: 'index_all_madoc_resources',
    },
    {
      service: 'madoc',
      name: 'index_madoc_resource',
    },
    {
      service: 'madoc',
      name: 'madoc_manifest_enrichment_pipeline',
    },
    {
      service: 'madoc',
      name: 'madoc_resource_enrichment_pipeline',
    },
    {
      service: 'madoc',
      name: 'nlp_madoc_resource',
    },
    {
      service: 'madoc',
      name: 'ocr_madoc_resource',
    },
  ];

  // Dev friendly helpers.
  listAllTopics(page = 1) {
    return this.api.publicRequest<TopicTypeListResponse>(`/madoc/api/topic-types?page=${page}`);
  }

  listAllTopicTypes(page = 1) {
    return this.api.publicRequest<TopicTypeListResponse>(`/madoc/api/topic-types?page=${page}`);
  }

  tagMadocResource(entityId: string, type: string, id?: number, selector?: any) {
    return this.api.request(`/api/enrichment/resource_tag/`, {
      method: 'POST',
      body: {
        entity: entityId,
        madoc_id: `urn:madoc:${type.toLowerCase()}:${id}`,
        selector,
      },
    });
  }

  topicTypeAutoComplete(fullText: string, page = 1) {
    return this.api.request<any>(`/api/enrichment/entity_type_autocomplete/?${stringify({ page })}`, {
      method: 'POST',
      body: {
        fulltext: fullText,
      },
    });
  }

  topicAutoComplete(type: string, fullText: string, page = 1) {
    return this.api.request<EnrichmentEntityAutoCompleteResponse>(
      `/api/enrichment/entity_autocomplete/?${stringify({ page })}`,
      {
        method: 'POST',
        body: {
          type: type,
          fulltext: fullText,
        },
      }
    );
  }

  getEnrichmentResource(id: string) {
    return this.api.request<EnrichmentResourceResponse>(`/api/enrichment/resource/${id}/`);
  }

  // TODO type for this
  getAllTags() {
    return this.api.request<any>(`/api/enrichment/resource_tag/`);
  }

  getResourceTag(id: string) {
    return this.api.request<any>(`/api/enrichment/resource_tag/${id}/`);
  }

  async removeResourceTag(id: string) {
    return this.api.request(`/api/enrichment/resource_tag/${id}/`, {
      method: 'DELETE',
    });
  }
  getCanvasTags(id: number) {
    // @todo
  }
}
