import React from 'react';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { Slot } from '../../shared/page-blocks/slot';
import { TopicHero } from '../features/TopicHero';
import { FeaturedTopicItems } from '../features/FeaturedTopicItems';
import { RelatedTopics } from '../features/RelatedTopics';
import { SearchPagination } from '../features/SearchPagination';
import { AppliedFacets } from '../features/AppliedFacets';
import { SearchPageResults } from '../features/SearchPageResults';
import { SearchPageFilters } from '../features/SearchPageFilters';
import { TopicActions } from '../features/TopicActions';
import { TopicAuthorities } from '../features/TopicAuthorities';

export const ViewTopic = () => {
  return (
    <>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <Slot name="topic-hero-head">
        <TopicHero />
        <TopicAuthorities />
      </Slot>

      <Slot name="topic-featured">
        <FeaturedTopicItems />
      </Slot>

      <Slot name="topic-result-heading">
        <h3 style={{ fontSize: '1.5em', color: 'inherit' }}>Explore all resources</h3>
        <TopicActions />
      </Slot>

      <div style={{ display: 'flex' }}>
        <div style={{ maxWidth: 300 }}>
          <Slot name="topic-results-filters" small>
            <SearchPageFilters />
          </Slot>
        </div>

        <div style={{ width: '100%' }}>
          <Slot name="topic-item-results">
            <AppliedFacets />
            <SearchPageResults />
          </Slot>

          <Slot name="topic-items-pagination">
            <SearchPagination />
          </Slot>
        </div>

      </div>

      <Slot name="topic-related">
        <RelatedTopics />
      </Slot>
    </>
  );
};
