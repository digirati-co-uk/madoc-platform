import { BaseDjangoExtension } from '../base-django-extension';
import {
  Authority,
  AuthoritySnippet,
  EnrichmentEntitySnippet,
  EnrichmentEntityAuthority,
  EnrichmentEntityType,
  EnrichmentEntityTypeSnippet,
  ResourceTag,
  ResourceTagSnippet,
  EnrichmentEntity,
  EntityTypesMadocResponse,
  EntitiesMadocResponse,
  EntityMadocResponse,
  EntityTypeMadocResponse,
} from './types';

export class AuthorityExtension extends BaseDjangoExtension {
  static AUTHORITY = 'authority_service';

  // /api/authority_service/entity/
  // /api/authority_service/entity/<id>/
  // /api/authority_service/entity_authority/
  // /api/authority_service/entity_authority/<id>/
  // /api/authority_service/entity_type/
  // /api/authority_service/entity_type/<id>/
  // /api/authority_service/resource_tag/
  // /api/authority_service/resource_tag/<id>/
  // @todo /api/authority_service/search/
  // @todo /api/authority_service/tasks/
  // /api/authority_service/tasks/fetch_authority_data/
  // /api/authority_service/tasks/populate_entity/
  // /api/authority_service/tasks/populate_entity_authority/

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
  ];

  getServiceName() {
    return 'authority_service';
  }

  // list of entity types
  getEntityTypes() {
    return this.api.request<EntityTypesMadocResponse>(`/api/enrichment/entity_type/`);
  }

  // Entity Type - Retrieve
  getEntityType(slug: string) {
    return this.api.request<EntityTypeMadocResponse>(`/api/enrichment/entity_type/${slug}/`);
  }

  // Entity - List, filtered by chosen Entity Type
  getEntities(slug: string, page?: number) {
    return this.api.request<EntitiesMadocResponse>(`/api/enrichment/entity/${slug}/?page=${page}/`);
  }

  // Entity - Retrieve
  getEntity(entity_type_slug: string, slug: string) {
    return this.api.request<EntityMadocResponse>(`/api/enrichment/entity/${entity_type_slug}/${slug}/`);
  }

  authority = this.createServiceHelper<Authority, AuthoritySnippet>('authority_service', 'authority');
  entity = this.createPaginatedServiceHelper<EnrichmentEntity, EnrichmentEntitySnippet>('authority_service', 'entity');
  entity_authority = this.createPaginatedServiceHelper<EnrichmentEntityAuthority>(
    'authority_service',
    'entity_authority'
  );
  entity_type = this.createPaginatedServiceHelper<EnrichmentEntityType, EnrichmentEntityTypeSnippet>(
    'authority_service',
    'entity_type'
  );
  resource_tag = this.createPaginatedServiceHelper<ResourceTag, ResourceTagSnippet>(
    'authority_service',
    'resource_tag'
  );
}
