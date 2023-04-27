import { SearchIndexable } from '../../../utility/capture-model-to-indexables';
import { BaseDjangoExtension } from '../base-django-extension';
import { ResourceRelationship } from './types';
import * as T from './types';

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
