import React, { useRef } from 'react';
import { ImageGrid } from '../../../frontend/shared/atoms/ImageGrid';
import { FieldComponent } from '../../../frontend/shared/capture-models/types/field-types';
import { useTopicType } from '../../../frontend/site/pages/loaders/topic-type-loader';
import { TopicSnippetCard } from '../../../frontend/shared/components/TopicSnippet';
import { Subheading3 } from '../../../frontend/shared/typography/Heading3';
import { RoundedCard } from '../../../frontend/shared/capture-models/editor/components/RoundedCard/RoundedCard';
import { useApiTopic } from '../../../frontend/shared/hooks/use-api-topic';
import { useParams } from 'react-router-dom';

export type TopicExplorerProps = {
  id: string;
  label: string;
  type: string;
  value: string | null;
};

export const TopicExplorer: FieldComponent<TopicExplorerProps> = ({ value, updateValue }) => {
  const container = useRef<HTMLDivElement>(null);
  const { topicType } = useParams<Record<'topicType', any>>();

  const { data } = useTopicType();
  const { data: topicDetails } = useApiTopic(topicType, value);

  if (value && topicDetails) {
    return (
      <RoundedCard interactive size="small" onClick={() => updateValue(null)}>
        <TopicSnippetCard topic={topicDetails} cardBorder="black" size={'small'} />
      </RoundedCard>
    );
  }

  return (
    <div ref={container} style={{ maxHeight: 500, overflowY: 'scroll', border: '1px solid grey', padding: '0.5em' }}>
      <ImageGrid>
        {data?.pagination.totalResults === 0 && <Subheading3>No topics in this type</Subheading3>}
        {data?.topics.map(topic => (
          <TopicSnippetCard
            key={topic.id}
            topic={topic}
            size='small'
            onClick={() => {
              updateValue(topic.slug);
            }}
          />
        ))}
      </ImageGrid>
    </div>
  );
};
