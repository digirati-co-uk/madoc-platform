import React from 'react';
import { LocaleString } from '../../../shared/components/LocaleString';
import { Heading1 } from '../../../shared/typography/Heading1';
import { HrefLink } from '../../../shared/utility/href-link';
import { useRelativeLinks } from '../../../site/hooks/use-relative-links';
import { useTopicType } from '../../../site/pages/loaders/topic-type-loader';
import { TopicSnippetCard } from '../../../shared/components/TopicSnippet';
import { Heading3 } from '../../../shared/typography/Heading3';
import { TimeAgo } from '../../../shared/atoms/TimeAgo';
import styled from 'styled-components';

const InfoContainer = styled.div`
  ul {
    padding: 0;

    li {
      margin-bottom: 0.5em;
    }
  }
`;

export function ListTopicsInType() {
  const createLink = useRelativeLinks(true);
  const { data } = useTopicType();
  console.log(data);

  return (
    <>
      <Heading1 as={LocaleString}>{data?.label || { none: ['...'] }}</Heading1>
      <InfoContainer>
        <ul style={{ listStyle: 'none' }}>
          <li>
            <b>ID</b>: {data.id}
          </li>
          <li>
            <b>Created</b>: <TimeAgo date={data.created} />
          </li>
          <li>
            <b>Slug</b>: {data.slug}
          </li>
          <li>
            <b>Label</b>: <LocaleString>{data?.label}</LocaleString>
          </li>
          <li>
            <b>Other labels</b>: <LocaleString>{data?.other_labels}</LocaleString>
          </li>
          <li>
            <b>Description</b>: <LocaleString>{data?.description}</LocaleString>
          </li>
          <li>
            <b>summary</b>: <LocaleString>{data?.editorial.summary}</LocaleString>
          </li>
          <li>
            <b>Topics</b>: {data?.pagination.totalResults}
          </li>
          <li>
            <b>Image</b>:
          </li>
          <li>
            <img style={{ maxWidth: '150px' }} src={data?.image_url} />
          </li>
        </ul>
      </InfoContainer>

      <Heading3> Topics in this type:</Heading3>
      {data?.topics.map(topic => (
        <HrefLink href={createLink({ topic: topic.slug })} key={topic.id}>
          <TopicSnippetCard topic={topic} cardBorder="black" size={'small'} />
        </HrefLink>
      ))}

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}
