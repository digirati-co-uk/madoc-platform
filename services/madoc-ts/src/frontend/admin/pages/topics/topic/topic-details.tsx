import React from 'react';
import { useTopic } from '../../../../site/pages/loaders/topic-loader';
import { Heading1, Subheading1 } from '../../../../shared/typography/Heading1';
import { LocaleString } from '../../../../shared/components/LocaleString';
import styled from 'styled-components';

const TopicContainer = styled.div`
  display: flex;
`;

const TopicImage = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }
`;

const Details = styled.div`
  position: absolute;
  background-color: rgba(241, 238, 238, 0.9);
  padding: 1em;
  bottom: 0;
  width: 100%;
  height: auto;

  ul {
    padding: 0;

    li {
      margin-bottom: 0.5em;
    }
  }
`;

export function TopicDetails() {
  const { data } = useTopic();

  if (!data) {
    return null
  }
  return (
    <>
      <TopicContainer>
        <TopicImage>
          <img src={data.other_data?.main_image?.url} />

          <Details>
            <Heading1 as={LocaleString}>{data.title || { none: ['...'] }}</Heading1>
            <ul style={{ listStyle: 'none' }}>
              <li>
                <b>ID</b>: {data.id}
              </li>
              <li>
                <b>Slug</b>: {data.slug}
              </li>
              <li>
                <b>Title</b>: <Subheading1 as={LocaleString}>{data.title}</Subheading1>
              </li>
              <li>
                <b>Description</b>: <LocaleString>{data.description}</LocaleString>
              </li>
              <li>
                <b>Summary</b>: <LocaleString>{data.other_data?.topic_summary}</LocaleString>
              </li>
              <li>
                <b>Secondary Heading</b>: <LocaleString>{data.other_data?.secondary_heading}</LocaleString>
              </li>
              <li>
                <b>Type</b>: {data.type}
              </li>
            </ul>
          </Details>
        </TopicImage>
      </TopicContainer>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
}
