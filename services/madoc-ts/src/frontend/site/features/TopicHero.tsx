import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import React from 'react';
import styled from 'styled-components';
import { useTopic } from '../pages/loaders/topic-loader';
import { LocaleString } from '../../shared/components/LocaleString';

const TopicHeroWrapper = styled.div`
  display: flex;
`;

const HeroText = styled.div`
  display: flex;
  flex-direction: column;
`;

const HeroHeading = styled.h1`
  font-size: 3em;
  line-height: 56px;
  font-weight: 700;
  margin-bottom: 12px;
`;

const HeroSummary = styled.p`
  font-size: 1em;
  line-height: 30px;
  font-weight: 500;
`;

const HeroSubHeading = styled.h2`
  font-size: 1.75em;
  line-height: 36px;
  font-weight: 600;
  margin-bottom: 12px;
`;
const HeroDescription = styled.p`
  font-size: 1em;
  line-height: 28px;
  font-weight: 400;
`;

const ImageMask = styled.div`
  height: 500px;
  width: 500px;
  border-radius: 100%;
  background-size: contain;
  background-position: center;
  margin-left: 4em;
`;
const Right = styled.div`
  margin-left: auto;
  display: flex;
  flex-direction: column;
`;

export const TopicHero: React.FC<{ h1Color?: string; h2Color?: string }> = ({ h1Color, h2Color }) => {
  const { data } = useTopic();
  if (!data) {
    return null;
  }
  return (
    <TopicHeroWrapper>
      <HeroText>
        <HeroHeading style={{ color: h1Color }} as={LocaleString}>
          {data?.title}
        </HeroHeading>

        {data.description && (
          <HeroDescription style={{ color: h1Color }} as={LocaleString}>
            {data.description}
          </HeroDescription>
        )}

        {data.secondary_heading && (
          <HeroSubHeading style={{ color: h2Color }} as={LocaleString}>
            {data.secondary_heading}
          </HeroSubHeading>
        )}

        {data.topic_summary && (
          <HeroSummary style={{ color: h2Color }} as={LocaleString}>
            {data.topic_summary}
          </HeroSummary>
        )}
      </HeroText>
      <Right>{data.image_url && <ImageMask style={{ backgroundImage: `url("${data.image_url}")` }} />}</Right>
    </TopicHeroWrapper>
  );
};

blockEditorFor(TopicHero, {
  type: 'default.TopicHero',
  label: 'Topic hero',
  anyContext: [],
  defaultProps: {
    h1Color: '#000000',
    h2Color: '#000000',
  },
  editor: {
    h1Color: { label: 'Heading and summary color', type: 'color-field' },
    h2Color: { label: 'Subheading and description color', type: 'color-field' },
  },
});
