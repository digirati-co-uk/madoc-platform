import React from 'react';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { Slot } from '../../shared/page-blocks/slot';
import { TopicHero } from '../features/TopicHero';
import { FeaturedTopicItems } from '../features/FeaturedTopicItems';
import { StaticPage } from '../features/StaticPage';
import { RelatedTopics } from '../features/RelatedTopics';
import { SearchPagination } from '../features/SearchPagination';
import { AppliedFacets } from '../features/AppliedFacets';
import { SearchPageResults } from '../features/SearchPageResults';
import { SearchPageFilters } from '../features/SearchPageFilters';
import { AutoSlotLoader } from '../../shared/page-blocks/auto-slot-loader';

export const ViewTopic = () => {
  return (
    <AutoSlotLoader>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <Slot name="topic-header">
        <TopicHero />
      </Slot>

      <Slot name="topic-featured">
        <FeaturedTopicItems />
      </Slot>

      <Slot name="topic-result-heading">
        <h3 style={{ fontSize: '1.5em', color: 'inherit' }}>Explore all resources</h3>
      </Slot>

      <div style={{ display: 'flex' }}>
        <div style={{ maxWidth: 300 }}>
          <Slot name="topic-page-filters" small>
            <SearchPageFilters hideTitle={true} dropdown={true} />
          </Slot>
        </div>

        <div style={{ width: '100%' }}>
          <Slot name="topic-item-results">
            <AppliedFacets />
            <SearchPageResults />
          </Slot>

          <Slot name="topic-items-pagination">
            <SearchPagination paginationStyle={true} position={'flex-start'} />
          </Slot>
        </div>
      </div>
      <Slot name="topic-related">
        <RelatedTopics />
      </Slot>
    </AutoSlotLoader>
  );
};
