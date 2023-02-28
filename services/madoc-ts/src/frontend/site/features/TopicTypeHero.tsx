import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import React from 'react';
import styled from 'styled-components';
import { LocaleString } from '../../shared/components/LocaleString';
import { useTopicType } from '../pages/loaders/topic-type-loader';

const TopicHeroWrapper = styled.div`
  margin-left: -2.3em;
  margin-right: -2.3em;
  position: relative;
  height: 500px;
`;
const TopWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const BackgroundImage = styled.div<{ $overlay?: string }>`
  background-repeat: no-repeat;
  background-size: cover;
  background-position: right;
  position: absolute;
  height: 100%;
  width: 100%;
  :after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: ${props => (props.$overlay ? props.$overlay : '#002d4b')};
    opacity: 70%;
  }
`;
const TextBox = styled.div`
  background-color: white;
  position: absolute;
  width: 80%;
  padding: 4em 6em;
  left: 10%;
  bottom: 0;
`;

export const HeroHeading = styled.h1`
  font-size: 3em;
  line-height: 56px;
  font-weight: 700;
  grid-column: span 7;
  grid-row: row 1;
  margin: 0;
`;
export const HeroSubHeading = styled.p`
  font-size: 1.37em;
  line-height: 30px;
  font-weight: 500;
`;

export const TopicTypeHero: React.FC<{ textColor?: string; overlayColor?: string }> = ({ textColor, overlayColor }) => {
  const { data } = useTopicType();

  if (!data) {
    return null;
  }
  return (
    <TopicHeroWrapper style={{ color: textColor }}>
      <BackgroundImage $overlay={overlayColor} style={{ backgroundImage: `url("${data.image_url}")` }} />
      <TextBox>
        <TopWrapper>
          <HeroHeading as={LocaleString}>{data.label}</HeroHeading>
        </TopWrapper>
        {data.description && <HeroSubHeading as={LocaleString}>{data.description}</HeroSubHeading>}
      </TextBox>
    </TopicHeroWrapper>
  );
};

blockEditorFor(TopicTypeHero, {
  type: 'default.topicTypeHero',
  label: 'Topic type hero',
  anyContext: ['topic'],
  requiredContext: ['topic'],
  editor: {
    textColor: { label: 'Heading and summary color', type: 'color-field' },
    OverlayColor: { label: 'Overlay color', type: 'color-field' },
  },
});
