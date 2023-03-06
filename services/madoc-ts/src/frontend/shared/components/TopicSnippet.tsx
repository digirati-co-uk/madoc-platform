import { TopicSnippet } from '../../../types/schemas/topics';
import { CroppedImage } from '../atoms/Images';
import { LocaleString, useCreateLocaleString } from './LocaleString';
import { SingleLineHeading3, Subheading3 } from '../typography/Heading3';
import { Heading5 } from '../typography/Heading5';
import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { SnippetContainer } from '../atoms/SnippetLarge';

const TopicSnippetContainer = styled(SnippetContainer)`
  height: 250px;
  max-width: 800px;
  padding: 0;
  margin-left: auto;
  margin-right: auto;
    
  &[data-is-small='true'] {
    height: 150px;
    margin: 1em 0 1em 0;
  }
`;
const CardText = styled.div`
  margin: 0 1em;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
`;

const TypePill = styled.div`
  background: #f5d8c0;
  color: #002d4b;
  border-radius: 4px;
  font-size: 12px;
  padding: 4px;
  margin: 0.5em 0;
  display: inline-block;
`;

export const TopicSnippetCard: React.FC<{
  topic: TopicSnippet;
  background?: string;
  textColor?: string;
  cardBorder?: string;
  size?: string;
}> = ({ topic, cardBorder, textColor, background, size }) => {
  const createLocaleString = useCreateLocaleString();
  const { t } = useTranslation();

  return (
    <TopicSnippetContainer
      data-is-small={size === 'small'}
      style={{ border: cardBorder ? `1px solid ${cardBorder}` : '', backgroundColor: background ? background : '' }}
      interactive
      flat
    >
      <CroppedImage $size="small" $covered>
        {topic.image_url ? (
          <img alt={createLocaleString(topic.label, t('item thumbnail'))} src={topic.image_url} />
        ) : null}
      </CroppedImage>
      <CardText>
        <LocaleString as={SingleLineHeading3} style={{ color: textColor }}>
          {topic.title}
        </LocaleString>

        <Subheading3> todo awaiting BE</Subheading3>

        <div>
          <Heading5 style={{ padding: 0, color: textColor }}>PART OF</Heading5>
          <TypePill>{topic.type}</TypePill>
        </div>
      </CardText>
    </TopicSnippetContainer>
  );
};
