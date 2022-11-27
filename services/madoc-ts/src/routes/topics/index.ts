import { RouteWithParams, TypedRouter } from '../../utility/typed-router';
// import { siteTopicTypes } from '../site/site-topic-types';
// import { siteTopics } from '../site/site-topics';
import { topicTypeAutocomplete } from './topic-type-autocomplete';

export const topicRoutes: Record<keyof any, RouteWithParams<any>> = {
  'topic-type-autocomplete': [TypedRouter.GET, '/api/madoc/topic-types/autocomplete', topicTypeAutocomplete],

  // Site routes.
  // 'site-topic-types': [TypedRouter.GET, '/s/:slug/madoc/api/topic-types', siteTopicTypes],
  // 'site-topic-type': [TypedRouter.GET, '/s/:slug/madoc/api/topic-types/:slug', siteTopicTypes],
  // 'site-topics': [TypedRouter.GET, '/s/:slug/madoc/api/topics', siteTopics],
  // topic type
  // single topic
};
