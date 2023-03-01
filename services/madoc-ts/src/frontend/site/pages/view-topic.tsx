import React from 'react';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { Pagination } from '../../shared/components/Pagination';
import { SearchResults } from '../../shared/components/SearchResults';
import { useTopicItems } from '../../shared/hooks/use-topic-items';
import { Slot } from '../../shared/page-blocks/slot';
import { TopicHero } from '../features/TopicHero';
import { useParams } from 'react-router-dom';
import { FeaturedTopicItems } from '../features/FeaturedTopicItems';
import { StaticPage } from '../features/StaticPage';
import { RelatedTopics } from '../features/RelatedTopics';
import { SearchPagination } from '../features/SearchPagination';
import { AppliedFacets } from '../features/AppliedFacets';
import { SearchPageResults } from '../features/SearchPageResults';
import { SearchPageFilters } from '../features/SearchPageFilters';
import { LocaleString } from '../../shared/components/LocaleString';

export const ViewTopic = () => {
  return (
    <StaticPage title="topic">
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <Slot name="topic-header">
        <TopicHero />
      </Slot>

      <Slot name="topic-featured">
        <FeaturedTopicItems />
      </Slot>

      <h3 style={{ fontSize: '1.5em', color: 'inherit' }}>Explore all resources</h3>

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
    </StaticPage>
  );
};
