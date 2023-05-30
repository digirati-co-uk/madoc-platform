import { RouteWithParams, TypedRouter } from '../../utility/typed-router';
import { topicTypeAutocomplete } from './topic-type-autocomplete';
import { siteTopic } from '../site/site-topic';
import { siteTopicType } from '../site/site-topic-type';
import { siteTopicTypes } from '../site/site-topic-types';
import { siteResource } from '../site/site-enrichment-resource';

export const topicRoutes: Record<keyof any, RouteWithParams<any>> = {
  'topic-type-autocomplete': [TypedRouter.GET, '/api/madoc/topic-types/autocomplete', topicTypeAutocomplete],
  'site-topic': [TypedRouter.GET, '/s/:slug/madoc/api/topics/:type/:topic', siteTopic],
  'site-topic-type': [TypedRouter.GET, '/s/:slug/madoc/api/topics/:type', siteTopicType],
  'site-topic-types': [TypedRouter.GET, '/s/:slug/madoc/api/topics', siteTopicTypes],
  'site-enrichment-resource': [TypedRouter.GET, '/s/:slug/madoc/api/resource/:id', siteResource],
};
