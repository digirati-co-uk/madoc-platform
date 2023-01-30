import React from 'react';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { Slot } from '../../shared/page-blocks/slot';
import { TopicTypeHero } from '../features/TopicTypeHero';
import { TopicGrid } from '../features/TopicGrid';

export function ViewTopicType() {
  return (
    <>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <Slot name="topic-type-hero">
        <TopicTypeHero />
      </Slot>

      <Slot name="topic-type-topics">
        <TopicGrid />
      </Slot>
      {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
    </>
  );
}
