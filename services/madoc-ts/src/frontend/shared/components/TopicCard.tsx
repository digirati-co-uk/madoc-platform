import { TopicSnippet } from '../../../types/schemas/topics';
import { ImageStripBox } from '../atoms/ImageStrip';
import { CroppedImage } from '../atoms/Images';
import { LocaleString, useCreateLocaleString } from './LocaleString';
import { SingleLineHeading3, Subheading3 } from '../typography/Heading3';
import { Heading5 } from '../typography/Heading5';
import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

const TopicStripBox = styled(ImageStripBox)`
  height: 300px;
  ${CroppedImage} {
    height: 100px;
    width: 100%;

    img {
      object-position: 50% 20% !important;
    }
  }
`;

const TypePill = styled.div`
  background: #f5d8c0;
  color: #002d4b;
  border-radius: 4px;
  font-size: 12px;
  padding: 4px;
  margin-top: 0.5em;
  display: inline-block;
`;

export const TopicCard: React.FC<{
  topic: TopicSnippet;
  background?: string;
  textColor?: string;
  cardBorder?: string;
}> = ({ topic, cardBorder = '#002d4b', textColor = '#002d4b', background = 'white' }) => {
  const createLocaleString = useCreateLocaleString();
  const { t } = useTranslation();
  return (
    <TopicStripBox $border={cardBorder} $color={textColor} $bgColor={background}>
      <CroppedImage $covered>
        {topic.other_data?.thumbnail ? (
          <img
            style={{ objectPosition: 'top' }}
            alt={createLocaleString(topic.other_data?.thumbnail.alt)}
            src={topic.other_data?.thumbnail?.url}
          />
        ) : null}
      </CroppedImage>
      <div style={{ margin: '1em' }}>
        <LocaleString as={SingleLineHeading3} style={{ color: textColor }}>
          {topic.title}
        </LocaleString>

        <Subheading3>
          {topic.tagged_resource_count || 0} {t('appearances')}
        </Subheading3>

        <Heading5 style={{ padding: 0 }}>{t('PART OF')}</Heading5>
        {topic.type_title.length ? (
          <TypePill as={LocaleString}>{topic.type_title}</TypePill>
        ) : (
          <TypePill>{topic.type}</TypePill>
        )}
      </div>
    </TopicStripBox>
  );
};
