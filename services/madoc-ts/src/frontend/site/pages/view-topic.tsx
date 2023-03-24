import React from 'react';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { Slot } from '../../shared/page-blocks/slot';
import { TopicHero } from '../features/TopicHero';
import { FeaturedTopicItems } from '../features/FeaturedTopicItems';
import { RelatedTopics } from '../features/RelatedTopics';
import { SearchPagination } from '../features/SearchPagination';
import { AppliedFacets } from '../features/AppliedFacets';
import { SearchPageFilters } from '../features/SearchPageFilters';
import { TopicActions } from '../features/TopicActions';
import { TopicAuthorities } from '../features/TopicAuthorities';
import { TopicHeroImage } from '../features/TopicHeroImage';
import { SearchPageResults } from '../features/SearchPageResults';
import {TopicItemsResults} from "../features/TopicItemsResults";
export const ViewTopic = () => {
  return (
    <>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <div style={{ display: 'flex' }}>
        <div style={{ width: '100%' }}>
          <Slot name="topic-hero-left">
            <TopicHero />
            <TopicAuthorities />
          </Slot>
        </div>
        <div style={{ maxWidth: 400 }}>
          <Slot name="topic-hero-right" small>
            <TopicHeroImage />
          </Slot>
        </div>
      </div>

      <Slot name="topic-featured">
        <FeaturedTopicItems />
      </Slot>

      <Slot name="topics-result-heading">
        <TopicActions />
      </Slot>

      <div style={{ display: 'flex' }}>
        <div style={{ maxWidth: 500 }}>
          <Slot name="topic-results-filters" small>
            <SearchPageFilters />
          </Slot>
        </div>

        <div style={{ width: '100%' }}>
          <Slot name="topic-item-results">
            <AppliedFacets />
            <TopicItemsResults />
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
