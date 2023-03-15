import { InternationalString } from '@iiif/presentation-3';
import React, { useRef } from 'react';
import { RoundedCard } from '../../../frontend/shared/capture-models/editor/components/RoundedCard/RoundedCard';
import { LocaleString, useCreateLocaleString } from '../../../frontend/shared/components/LocaleString';
import { CroppedImage } from '../../../frontend/shared/atoms/Images';
import { useTranslation } from 'react-i18next';
import { ImageStripBox } from '../../../frontend/shared/atoms/ImageStrip';
import { ImageGrid } from '../../../frontend/shared/atoms/ImageGrid';
import { Heading5 } from '../../../frontend/shared/typography/Heading5';
import { useParams } from 'react-router-dom';
import { useInfiniteQuery } from 'react-query';
import { useApi } from '../../../frontend/shared/hooks/use-api';
import { useInfiniteAction } from '../../../frontend/site/hooks/use-infinite-action';
import { Button } from '../../../frontend/shared/navigation/Button';
import { EnrichmentEntitySnippet } from '../../enrichment/authority/types';
import { FieldComponent } from '../../../frontend/shared/capture-models/types/field-types';
import { useTopicType } from '../../../frontend/site/pages/loaders/topic-type-loader';
import { TopicSnippetCard } from '../../../frontend/shared/components/TopicSnippet';
import { Subheading3 } from '../../../frontend/shared/typography/Heading3';

export type TopicExplorerProps = {
  id: string;
  label: string;
  type: string;
  value: EnrichmentEntitySnippet | null;
};

export const TopicExplorer: FieldComponent<TopicExplorerProps> = ({ value, updateValue }) => {
  const api = useApi();
  const { t } = useTranslation();
  const container = useRef<HTMLDivElement>(null);
  const createLocaleString = useCreateLocaleString();

  const { data } = useTopicType();

  if (value) {
    return (
      <div>
        <TopicSnippetCard topic={value} cardBorder="black" size={'small'} />
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
            onClick={() =>
              updateValue({
                title: topic.title,
                image_url: topic.image_url,
              })
            }
          >
            <CroppedImage>
              {topic.image_url ? (
                <img alt={createLocaleString(topic.image_url, t('Item thumbnail'))} src={topic.image_url} />
              ) : null}
            </CroppedImage>
            <LocaleString as={Heading5}>{topic.title}</LocaleString>
          </ImageStripBox>
        ))}
      </ImageGrid>
    </div>
  );
};
