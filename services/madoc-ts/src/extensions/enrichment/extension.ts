import { BaseDjangoExtension } from './base-django-extension';
import { EnrichmentIndexPayload } from './types';
import {
  EnrichmentEntityAutoCompleteResponse,
  EnrichmentResourceList,
  EnrichmentResource,
  EntitiesMadocResponse,
  EntityMadocResponse,
  EntityTypeMadocResponse,
  EntityTypesMadocResponse,
  ResourceQuery,
  ResourceQueryResponse,
  ResourceTagList,
  ResourceTag,
  EntityQuery,
  EntityTypeQuery,
} from './authority/types';
import { stringify } from 'query-string';

export class EnrichmentExtension extends BaseDjangoExtension {
  indexable_data = this.createPaginatedServiceHelper<any>('madoc', 'indexable_data');
  resource = this.createPaginatedServiceHelper<EnrichmentIndexPayload>('madoc', 'resource');

  allTasks = [
    // Authority service.
    {
      service: 'authority_service',
      name: 'populate_entity',
    },
    {
      service: 'authority_service',
      name: 'fetch_authority_data',
    },
    {
      service: 'authority_service',
      name: 'populate_entity_authority',
    },
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

  getServiceName(): string {
    return 'madoc';
  }

  /** RESOURCE */
  // Resource - List
  getEnrichmentResourceList(id: string) {
    return this.api.request<EnrichmentResourceList>(`/api/enrichment/resource/${id}/`);
  }

  // Resource - Retrieve
  getEnrichmentResource(id: string) {
    return this.api.request<EnrichmentResource>(`/api/enrichment/resource/${id}/`);
  }

  // Resource - Upsert
  UpsertEnrichmentResource(query: ResourceQuery) {
    return this.api.request<ResourceQueryResponse>(`/api/enrichment/resource/`, {
      method: 'POST',
      body: {
        ...query,
      },
    });
  }

  // Resource - Delete
  DeleteEnrichmentResource(madoc_id: string) {
    return this.api.request(`/api/enrichment/resource/${madoc_id}`, {
      method: 'DELETE',
    });
  }

  // Resource - Search: Return all of the resources for a given topic
  /** this is covered in searchQuery in the search extention */

  /** RESOURCE TAG */
  //ResourceTag - List
  getAllTags() {
    return this.api.request<ResourceTagList>(`/api/enrichment/resource_tag/`);
  }

  // ResourceTag - Retrieve
  getResourceTag(id: string) {
    return this.api.request<ResourceTag>(`/api/enrichment/resource_tag/${id}/`);
  }

  // ResourceTag - Create
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

  // ResourceTag - Delete
  removeResourceTag(id: string) {
    return this.api.request(`/api/enrichment/resource_tag/${id}/`, {
      method: 'DELETE',
    });
  }

  /** ENTITY */
  // Entity - list
  getAllEntities(page?: number) {
    return this.api.request<EntitiesMadocResponse>(`/api/enrichment/entity/?page=${page}`);
  }

  // Entity - List, filtered by chosen Entity Type
  getEntities(slug: string, page?: number) {
    return this.api.request<EntitiesMadocResponse>(`/api/enrichment/entity/${slug}/?page=${page}`);
  }

  // Entity - Retrieve
  getEntity(entity_type_slug: string, slug: string) {
    return this.api.request<EntityMadocResponse>(`/api/enrichment/entity/${entity_type_slug}/${slug}/`);
  }

  // Entity - Upsert
  upsertEntity(query: EntityQuery) {
    return this.api.request<EntityMadocResponse>(`/api/enrichment/entity/`, {
      method: 'POST',
      body: {
        ...query,
      },
    });
  }

  // Entity - Delete
  deleteEntity(type: string, slug: string) {
    return this.api.request(`/api/enrichment/entity/${type}/${slug}`, {
      method: 'DELETE',
    });
  }

  // Entity - Fulltext Search
  // api/enrichment/entity//entity_search/
  // TODO - dont think this is being used ??

  // Entity - Autocomplete Search
  entityAutoComplete(type: string, fullText: string, page = 1) {
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

  /** ENTITY TYPE */
  // Entity Type - List
  getEntityTypes() {
    return this.api.request<EntityTypesMadocResponse>(`/api/enrichment/entity_type/`);
  }

  // Entity Type - Retrieve
  getEntityType(slug: string) {
    return this.api.request<EntityTypeMadocResponse>(`/api/enrichment/entity_type/${slug}/`);
  }

  // Entity Type - Upsert
  upsertEntityType(query: EntityTypeQuery) {
    return this.api.request<EntityTypeMadocResponse>(`/api/enrichment/entity_type/`, {
      method: 'POST',
      body: {
        ...query,
      },
    });
  }
  // Entity Type - Delete
  deleteEntityType(slug: string) {
    return this.api.request(`/api/enrichment/entity_type/${slug}`, {
      method: 'DELETE',
    });
  }

  // Entity Type - Autocomplete Search
  entityTypeAutoComplete(fullText: string, page = 1) {
    return this.api.request<any>(`/api/enrichment/entity_type_autocomplete/?${stringify({ page })}`, {
      method: 'POST',
      body: {
        fulltext: fullText,
      },
    });
  }
}
