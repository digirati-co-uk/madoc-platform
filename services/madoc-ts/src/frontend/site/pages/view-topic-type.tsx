import React from 'react';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { LocaleString } from '../../shared/components/LocaleString';
import { Slot } from '../../shared/page-blocks/slot';
import { HrefLink } from '../../shared/utility/href-link';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useTopicType } from './loaders/topic-type-loader';
import { TopicTypeHero } from '../features/TopicTypeHero';

export function ViewTopicType() {
  const createLink = useRelativeLinks();
  const { data } = useTopicType();

  return (
    <>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <Slot name="topic-type-hero">
        <TopicTypeHero />
      </Slot>

      <ul>
        {data?.topics.map(topic => (
          <li key={topic.id}>
            <HrefLink href={createLink({ topic: topic.slug })}>
              <LocaleString>{topic.label}</LocaleString>
            </HrefLink>
          </li>
        ))}
      </ul>
      {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
    </>
  );
}
