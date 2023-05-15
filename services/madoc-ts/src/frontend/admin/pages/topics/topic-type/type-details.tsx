import React from 'react';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { Heading1 } from '../../../../shared/typography/Heading1';
import { useTopicType } from '../../../../site/pages/loaders/topic-type-loader';
import styled from 'styled-components';

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

const TopicTypeDetails = styled.div`
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

export function TypeDetails() {
  const { data } = useTopicType();

  if (!data) {
    return null;
  }

  return (
    <>
      <TopicTypeContainer>
        <TypeImage>
          <img src={data?.image_url} />

          <TopicTypeDetails>
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
          </TopicTypeDetails>
        </TypeImage>
      </TopicTypeContainer>

      <hr />
      <h2>JSON</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}
