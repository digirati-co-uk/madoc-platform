import React from 'react';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { LocaleString } from '../../shared/components/LocaleString';
import { Slot } from '../../shared/page-blocks/slot';
import { Heading1 } from '../../shared/typography/Heading1';
import { HrefLink } from '../../shared/utility/href-link';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useTopicType } from './loaders/topic-type-loader';

export function ViewTopicType() {
  const createLink = useRelativeLinks();
  const { data } = useTopicType();

  return (
    <>
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      {/* Custom slots.. */}
      <Heading1 as={LocaleString}>{data?.label || { none: ['...'] }}</Heading1>
      <ul>
        {data?.topics.map(topic => (
          <li key={topic.id}>
            <HrefLink href={createLink({ topic: topic.slug })}>
              <LocaleString>{topic.label}</LocaleString>
            </HrefLink>
          </li>
        ))}
      </ul>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}
