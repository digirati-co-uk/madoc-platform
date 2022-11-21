import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ImageGrid } from '../../shared/atoms/ImageGrid';
import { CroppedImage } from '../../shared/atoms/Images';

const TopicListingContainer = styled.div`
  background: #ecf5fc;
  margin-bottom: 20px;
  padding: 20px 20px 40px;

  ${ImageGrid} {
    grid-gap: 3em;
  }
`;

const TopicCard = styled.div`
  border: 1px solid #002d4b;
  position: relative;
`;

const TopicCardList = styled.div`
  display: flex;
  
  :hover {
    border: 1px dotted #002d4b;
  }
`;

const TopicTextBox = styled.div`
  background: #fff;
  width: 100%;
  padding: 3em 2em;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: absolute;
  bottom: 0;
  top: 92px;
  
  &[data-list-view] {
    position: relative;
    padding: 0.5em 1em;
    top: 0;
    bottom: 0;
  }
`;

const TopicHeading = styled.h3`
  color: #004761;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
`;

const TopicSubHeading = styled.div`
  color: #707070;
  font-size: 16px;
  font-weight: 400;

  span {
    color: #004761;
  }
`;

type topicType = {
  // count: string | number;
  // next?: string;
  // previous?: string;
  // results?: {
  url?: string;
  id?: string | number;
  created?: string;
  modified?: string;
  type: string;
  label?: string;
  thumbnail?: string;
}[];

export const TopicListing: React.FC = () => {
  const [topics, setTopics] = useState<topicType[]>([]);

  const fetchTopic = async () => {
    const api = async () => {
      const data = await fetch('https://enrichment.ida.madoc.io/madoc/entity/?format=json', {
        method: 'GET',
      });
      const jsonData = await data.json();
      setTopics(jsonData.results);
    };
    api();
  };

  useEffect(() => {
    fetchTopic();
  }, []);

  if (topics) {
    return (
      <TopicListingContainer>
        <h2>List of Topics </h2>
        <ImageGrid $size={'large'} data-view-list={false}>
          {topics.map(topic => {
            return (
              topic && (
                <TopicCard key={topic.id}>
                  <CroppedImage $covered={true}>
                    {topic.thumbnail ? (
                      <img alt="todo" src={topic.thumbnail} />
                    ) : (
                      <img alt="placeholder" src="https://via.placeholder.com/125" />
                    )}
                  </CroppedImage>
                  <TopicTextBox>
                    <TopicHeading>{topic.label}</TopicHeading>
                    <TopicSubHeading>123 Objects</TopicSubHeading>
                    <TopicSubHeading>
                      Part of: <span>{topic.type}</span>
                    </TopicSubHeading>
                  </TopicTextBox>
                </TopicCard>
              )
            );
          })}
        </ImageGrid>
      </TopicListingContainer>
    );
  }
  return null;
};

export const ViewSingleTopic: React.FC = () => {
  const [topicResults, setTopicResults] = useState<topicType[]>([]);

  const fetchTopic = async () => {
    const api = async () => {
      const data = await fetch(`https://enrichment.ida.madoc.io/madoc/search/?`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'entity', subtype: '0d38f500-d152-4fc8-9b91-cdb45931b0c3' }),
      });
      const jsonData = await data.json();
      console.log(data);

      setTopicResults(jsonData.results);
    };
    api();
  };

  useEffect(() => {
    fetchTopic();
  }, []);

  if (topicResults) {
    return (
      <TopicListingContainer>
        <h2>List of rescources </h2>
        <ImageGrid data-view-list={true}>
          {topicResults.map(result => {
            return (
              result && (
                <TopicCardList key={result.id}>
                  <CroppedImage $covered={true}>
                    {result.thumbnail ? (
                      <img alt="todo" src={result.thumbnail} />
                    ) : (
                      <img alt="placeholder" src="https://via.placeholder.com/125" />
                    )}
                  </CroppedImage>
                  <TopicTextBox data-list-view>
                    <TopicHeading>{result.madoc_id}</TopicHeading>
                    <TopicSubHeading>
                      Type: <span>{result.type}</span>
                    </TopicSubHeading>
                  </TopicTextBox>
                </TopicCardList>
              )
            );
          })}
        </ImageGrid>
      </TopicListingContainer>
    );
  }
  return null;
};
