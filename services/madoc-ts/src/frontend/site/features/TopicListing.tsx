import React from 'react';
import styled from 'styled-components';
import { ImageGrid } from '../../shared/atoms/ImageGrid';
import { CroppedImage } from '../../shared/atoms/Images';
import { SingleTopic } from '../../../types/topics';
import { useEnrichmentApi, useGetTopic, useGetTopicItems } from '../hooks/use-get-topic';

const TopicListingContainer = styled.div`
  background: #ecf5fc;
  margin-bottom: 20px;
  padding: 20px 20px 40px;

  ${ImageGrid} {
    grid-gap: 3em;
  }
`;

const SingleTopicContainer = styled.div`
  background: #ecf5fc;
  margin-bottom: 20px;
  padding: 20px 20px 40px;
  display: flex;
  flex-direction: column;
  height: 300px;
  justify-content: space-between;
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
  padding: 1em;
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

const formatDate = (d: string) => {
  const date: Date = new Date(d);
  return date.toDateString();
};

export const AllTopicListing: React.FC<{ url: string }> = ({ url }) => {
  const { data } = useEnrichmentApi(url);

  if (!data || !data.results) {
    return null;
  }
  return (
    <TopicListingContainer>
      <h2> {data.count} results </h2>
      <ImageGrid $size={'large'} data-view-list={false}>
        {data.results &&
          data.results.map((result: SingleTopic) => {
            return (
              result && (
                <TopicCard key={result.id}>
                  <CroppedImage $covered={true}>
                    <img alt="placeholder" src="https://via.placeholder.com/125" />
                  </CroppedImage>

                  <TopicTextBox>
                    <TopicHeading>{result.label}</TopicHeading>

                    <TopicSubHeading>
                      Part of: <span>{result.type}</span>
                    </TopicSubHeading>

                    {result.created && (
                      <TopicSubHeading>
                        Created: <span>{formatDate(result.created)}</span>
                      </TopicSubHeading>
                    )}
                    {result.modified && (
                      <TopicSubHeading>
                        Modified: <span>{formatDate(result.modified)}</span>
                      </TopicSubHeading>
                    )}

                    <TopicSubHeading>
                      ID: <span>{result.id}</span>
                    </TopicSubHeading>
                  </TopicTextBox>
                </TopicCard>
              )
            );
          })}
      </ImageGrid>
    </TopicListingContainer>
  );
};

export const TopicDetails: React.FC<{ topicId: string }> = ({ topicId }) => {
  const { data } = useGetTopic(topicId);

  if (!data) {
    return null;
  }

  return (
    <SingleTopicContainer>
      <TopicSubHeading>
        Label: <span>{data.label}</span>
      </TopicSubHeading>

      <TopicSubHeading>
        id: <span>{data.id}</span>
      </TopicSubHeading>

      <TopicSubHeading>
        url: <span>{data.url}</span>
      </TopicSubHeading>

      <TopicSubHeading>
        type: <span>{data.type}</span>
      </TopicSubHeading>

      {data.created && (
        <TopicSubHeading>
          created: <span>{formatDate(data.created)}</span>
        </TopicSubHeading>
      )}

      {data.modified && (
        <TopicSubHeading>
          modified: <span>{formatDate(data.modified)}</span>
        </TopicSubHeading>
      )}
    </SingleTopicContainer>
  );
};

export const TopicItemsList: React.FC<{ type: string; subtype: string }> = ({ type, subtype }) => {
  const { data: topicResults } = useGetTopicItems(type, subtype);
  const { data: topic } = useGetTopic(subtype);

  const results = topicResults && topicResults.results ? topicResults.results : null;

  if (!topicResults || !topic) {
    return null;
  }
  return (
    <TopicListingContainer>
      {topicResults && (
        <>
          <h1> Items in: {topic.label} </h1>
          <h2> {topicResults.count} results </h2>
          <ImageGrid data-view-list={true}>
            {results?.map((result, i) => {
              return (
                result && (
                  <TopicCardList key={i}>
                    <CroppedImage $covered={true}>
                      <img alt="placeholder" src="https://via.placeholder.com/125" />
                    </CroppedImage>

                    <TopicTextBox data-list-view>
                      <TopicHeading>Madoc Id: {result.madoc_id}</TopicHeading>

                      <TopicSubHeading>
                        Type: <span>{result.type}</span>
                      </TopicSubHeading>

                      {result.created && (
                        <TopicSubHeading>
                          Created: <span>{formatDate(result.created)}</span>
                        </TopicSubHeading>
                      )}
                      {result.modified && (
                        <TopicSubHeading>
                          Modified: <span>{formatDate(result.modified)}</span>
                        </TopicSubHeading>
                      )}
                    </TopicTextBox>
                  </TopicCardList>
                )
              );
            })}
          </ImageGrid>
        </>
      )}
    </TopicListingContainer>
  );
};
