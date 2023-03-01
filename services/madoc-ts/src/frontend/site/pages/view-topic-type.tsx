import React from 'react';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { Slot } from '../../shared/page-blocks/slot';
import { TopicTypeHero } from '../features/TopicTypeHero';
import { TopicGrid } from '../features/TopicGrid';
import { TopicTypePagination } from '../features/TopicTypePagination';
import { FeaturedTopics } from '../features/FeaturedTopics';
import { StaticPage } from '../features/StaticPage';
import {AutoSlotLoader} from "../../shared/page-blocks/auto-slot-loader";

export function ViewTopicType() {
  return (
    <AutoSlotLoader>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <Slot name="topic-type-hero">
        <TopicTypeHero />
      </Slot>

      <Slot name="topic-type-featured">
        <FeaturedTopics />
      </Slot>

      <Slot name="topic-type-topics">
        <TopicGrid />
      </Slot>

      <Slot name="topic-type-pagination">
        <TopicTypePagination />
      </Slot>
    </AutoSlotLoader>
  );
}
