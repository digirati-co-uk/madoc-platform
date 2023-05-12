import React from 'react';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { Heading1 } from '../../../../shared/typography/Heading1';
import { HrefLink } from '../../../../shared/utility/href-link';
import { useRelativeLinks } from '../../../../site/hooks/use-relative-links';
import { useTopicType } from '../../../../site/pages/loaders/topic-type-loader';
import { TopicSnippetCard } from '../../../../shared/components/TopicSnippet';
import { Heading3, Subheading3 } from '../../../../shared/typography/Heading3';
import styled from 'styled-components';
import { Pagination } from '../../../../shared/components/Pagination';

const TopicTypeContainer = styled.div`
  display: flex;
`;

const TypeImage = styled.div`
  position: relative;
  width: 100vw;
  height: 50vh;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
`;

const TypeDetails = styled.div`
  position: absolute;
  background-color: rgba(241, 238, 238, 0.9);
  padding: 1em;
  bottom: 0;
  width: 100%;

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
  return (
    <>
      <TopicTypeContainer>
        <TypeImage>
          <img src={data?.image_url} />

          <TypeDetails>
            <Heading1 as={LocaleString}>{data?.label || { none: ['...'] }}</Heading1>
            <ul style={{ listStyle: 'none' }}>
              <li>
                <b>ID</b>: {data?.id}
              </li>
              <li>
                <b>Slug</b>: {data?.slug}
              </li>
              <li>
                <b>Title</b>: <LocaleString>{data?.title}</LocaleString>
              </li>
              <li>
                <b>Description</b>: <LocaleString>{data?.description}</LocaleString>
              </li>
              <li>
                <b>Topics</b>: {data?.pagination.totalResults}
              </li>
            </ul>
          </TypeDetails>
        </TypeImage>
      </TopicTypeContainer>

      <Heading3> Topics in this type:</Heading3>
      <Pagination
        page={data?.pagination ? data?.pagination.page : 1}
        totalPages={data?.pagination ? data?.pagination.totalPages : 1}
        stale={!data?.pagination}
      />
      {data?.pagination.totalResults === 0 && <Subheading3>No topics in this type</Subheading3>}
      {data?.topics.map(topic => (
        <HrefLink href={createLink({ topic: topic.slug })} key={topic.id}>
          <TopicSnippetCard topic={topic} cardBorder="black" size={'small'} />
        </HrefLink>
      ))}
    </>
  );
}
