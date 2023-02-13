import { ImageGrid } from '../../shared/atoms/ImageGrid';
import { Link } from 'react-router-dom';
import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useTranslation } from 'react-i18next';
import { LocaleString, useCreateLocaleString } from '../../shared/components/LocaleString';
import { useTopicType } from '../pages/loaders/topic-type-loader';
import { ImageStripBox } from '../../shared/atoms/ImageStrip';
import { CroppedImage } from '../../shared/atoms/Images';
import { SingleLineHeading3, Subheading3 } from '../../shared/typography/Heading3';
import styled from 'styled-components';
import { Heading5 } from '../../shared/typography/Heading5';
import { TopicSnippet } from '../../../types/schemas/topics';

const Pill = styled.div`
  background: #f5d8c0;
  color: #002d4b;
  border-radius: 4px;
  font-size: 12px;
  padding: 4px;
  margin-top: 0.5em;
  display: inline-block;
`;

export const TopicGrid: React.FC<{
  background?: string;
  textColor?: string;
  cardBorder?: string;
  imageStyle?: string;
}> = ({ background = '#ffffff', textColor = '#002D4B', cardBorder = '#002D4B', imageStyle = 'covered' }) => {
  const { data } = useTopicType();
  const items = data?.topics;
  const createLocaleString = useCreateLocaleString();
  const createLink = useRelativeLinks();
  const { t } = useTranslation();
  if (!data) {
    return null;
  }

  const renderTopicSnippet = (topic: TopicSnippet) => {
    return (
      <ImageStripBox $border={cardBorder} $color={textColor} $bgColor={background}>
        <CroppedImage $covered={imageStyle === 'covered'}>
          {topic.thumbnail?.url ? (
            <img
              style={{ objectPosition: 'top' }}
              alt={createLocaleString(topic.label, t('Topic thumbnail'))}
              src={topic.thumbnail.url}
            />
          ) : null}
        </CroppedImage>
        <div style={{ margin: '1em' }}>
          <LocaleString as={SingleLineHeading3}>{topic.label}</LocaleString>

          {/* todo await BE */}
          <Subheading3> 123 Objects</Subheading3>

          <Heading5 style={{ padding: 0 }}>PART OF</Heading5>
          <Pill>{topic.topicType?.slug}</Pill>
        </div>
      </ImageStripBox>
    );
  };

  return (
    <div style={{ margin: '4em' }}>
      <ImageGrid $size="large">
        {items?.map(topic => (
          <Link
            key={topic.id}
            to={createLink({
              topic: topic.slug,
            })}
          >
            {renderTopicSnippet(topic)}
          </Link>
        ))}
      </ImageGrid>
    </div>
  );
}
blockEditorFor(TopicGrid, {
  type: 'default.TopicGrid',
  label: 'Topic Grid',
  defaultProps: {
    background: '#ffffff',
    textColor: '#002D4B',
    cardBorder: '#002D4B',
    imageStyle: 'covered',
  },
  editor: {
    background: { label: 'Card background color', type: 'color-field' },
    textColor: { label: 'Card text color', type: 'color-field' },
    cardBorder: { label: 'Card border', type: 'color-field' },
    imageStyle: {
      label: 'Image Style',
      type: 'dropdown-field',
      options: [
        { value: 'covered', text: 'covered' },
        { value: 'fit', text: 'fit' },
      ],
    },
  },
  requiredContext: ['topicType'],
  anyContext: ['topicType'],
});
