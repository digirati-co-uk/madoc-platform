import React, { useRef } from 'react';
import { LocaleString, useCreateLocaleString } from '../../../frontend/shared/components/LocaleString';
import { CroppedImage } from '../../../frontend/shared/atoms/Images';
import { ImageStripBox } from '../../../frontend/shared/atoms/ImageStrip';
import { ImageGrid } from '../../../frontend/shared/atoms/ImageGrid';
import { Heading5 } from '../../../frontend/shared/typography/Heading5';
import { EnrichmentEntitySnippet } from '../../enrichment/authority/types';
import { FieldComponent } from '../../../frontend/shared/capture-models/types/field-types';
import { useTopicType } from '../../../frontend/site/pages/loaders/topic-type-loader';
import { TopicSnippetCard } from '../../../frontend/shared/components/TopicSnippet';
import { Subheading3 } from '../../../frontend/shared/typography/Heading3';
import {extractIdFromUrn} from "../../../utility/parse-urn";

export type TopicExplorerProps = {
  id: string;
  label: string;
  type: string;
  value: string | null;
};

export const TopicExplorer: FieldComponent<TopicExplorerProps> = ({ value, updateValue }) => {
  const container = useRef<HTMLDivElement>(null);
  const createLocaleString = useCreateLocaleString();

  const { data } = useTopicType();

  const topicId = parseTopicId(value);

  if (value) {
    return (
      <div>
        <pre>{JSON.stringify(value, null, 2)}</pre>
        {/*<TopicSnippetCard topic={value} cardBorder="black" size={'small'} />*/}
      </div>
    );
  }

  return (
    <div ref={container} style={{ maxHeight: 500, overflowY: 'scroll', border: '1px solid grey', padding: '0.5em' }}>
      <ImageGrid $size="small">
        {data?.pagination.totalResults === 0 && <Subheading3>No topics in this type</Subheading3>}
        {data?.topics.map(topic => (
          <ImageStripBox
            key={topic.id}
            $border={'#000000'}
            $bgColor={'#eee'}
            onClick={() => {
              updateValue(topic);
            }}
          >
            <CroppedImage>
              {topic.other_data.thumbnail ? (
                <img alt={createLocaleString(topic.other_data.thumbnail.alt)} src={topic.other_data.thumbnail.url} />
              ) : null}
            </CroppedImage>
            <LocaleString as={Heading5}>{topic.title}</LocaleString>
          </ImageStripBox>
        ))}
      </ImageGrid>
    </div>
  );
};
function parseTopicId(topic: null | any): number | null {
  if (!topic) {
    return null;
  }
  if (topic.id) {
    return topic.id;
  }
  return topic;
}