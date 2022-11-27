import React from 'react';
import { LocaleString } from '../../../shared/components/LocaleString';
import { HrefLink } from '../../../shared/utility/href-link';
import { useRelativeLinks } from '../../../site/hooks/use-relative-links';
import { usePaginatedTopicTypes } from '../../../site/pages/loaders/topic-type-list-loader';

export function ListTopicTypes() {
  const createLink = useRelativeLinks(true);
  const { data } = usePaginatedTopicTypes();

  return (
    <ul>
      {data?.topicTypes.map(topicType => (
        <li key={topicType.id}>
          <HrefLink href={createLink({ topicType: topicType.slug })}>
            <LocaleString>{topicType.label}</LocaleString>
          </HrefLink>
        </li>
      ))}
    </ul>
  );
}
