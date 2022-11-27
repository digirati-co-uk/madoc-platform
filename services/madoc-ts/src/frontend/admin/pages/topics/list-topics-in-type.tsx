import React from 'react';
import { LocaleString } from '../../../shared/components/LocaleString';
import { Heading1 } from '../../../shared/typography/Heading1';
import { HrefLink } from '../../../shared/utility/href-link';
import { useRelativeLinks } from '../../../site/hooks/use-relative-links';
import { useTopicType } from '../../../site/pages/loaders/topic-type-loader';

export function ListTopicsInType() {
  const createLink = useRelativeLinks(true);
  const { data } = useTopicType();

  return (
    <>
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
