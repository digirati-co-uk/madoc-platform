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
} from './types';

export class AuthorityExtension extends BaseDjangoExtension {
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
