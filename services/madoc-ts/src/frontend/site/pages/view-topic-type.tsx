import React from 'react';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { Slot } from '../../shared/page-blocks/slot';
import { TopicTypeHero } from '../features/TopicTypeHero';
import { TopicGrid } from '../features/TopicGrid';
import { TopicTypePagination } from '../features/TopicTypePagination';
import { FeaturedTopics } from '../features/FeaturedTopics';

export function ViewTopicType() {
  return (
    <>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <Slot name="topic-type-hero">
        <TopicTypeHero />
      </Slot>

      <Slot name="featured-topics">
        <FeaturedTopics />
      </Slot>

      <Slot name="topics-grid">
        <TopicGrid />
        <TopicTypePagination />
      </Slot>
    </>
  );
}
