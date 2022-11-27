import { Topic, TopicType, TopicTypeListResponse } from '../../types/schemas/topics';
import { BaseDjangoExtension } from './base-django-extension';
import { EnrichmentIndexPayload } from './types';

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
  getSiteTopic(id: string, type: string) {
    return this.api.publicRequest<Topic>(`/madoc/api/topics/${type}/${id}`);
  }
  getSiteTopicTypes(page = 1) {
    return this.api.publicRequest<TopicTypeListResponse>(`/madoc/api/topics?page=${page}`);
  }
  getSiteTopicType(slug: string, page = 1) {
    return this.api.publicRequest<TopicType>(`/madoc/api/topics/${slug}?page=${page}`);
  }

  getTopicType(id: string) {
    return this.api.request(`/api/enrichment/entity/${id}/`);
  }

  getAllEnrichmentTasks(page = 1) {
    return this.api.request(`/api/enrichment/task_log?page=${page}`);
  }

  getEnrichmentTask(id: string) {
    return this.api.request(`/api/enrichment/task_log/${id}`);
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

  getTopicBySlug(type: string, slug: string) {
    // @todo
  }

  tagMadocResource(entityId: string, type: string, id: number, selector?: any) {
    return this.api.request(`/api/enrichment/resource_tag/`, {
      method: 'POST',
      body: {
        entity: entityId,
        madoc_id: `urn:madoc:${type.toLowerCase()}:${id}`,
        selector,
      },
    });
  }

  topicAutoComplete(type: string, query: string) {
    // @todo
  }

  getManifestTags(id: number) {
    // @todo
  }

  getCanvasTags(id: number) {
    // @todo
  }
}