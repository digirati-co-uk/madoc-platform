import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-react';
import React from 'react';
import styled from 'styled-components';
import { Share } from '@styled-icons/entypo/Share';
import { HeroHeading, HeroSubHeading } from './custom-ida-hero.style';
import { TextButton, Button } from '../../custom-components/Button/Button';

const TopicHeroWrapper = styled.div`
  margin-left: -2.3em;
  margin-right: -2.3em;
  position: relative;
  height: 600px;
`;
const TopWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`;

const BackgroundImage = styled.div`
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
    background-color: #002d4b;
    opacity: 70%;
  }
`;
const TextBox = styled.div`
  color: #002d4b;
  background-color: white;
  position: absolute;
  width: 80vw;
  padding: 4em 6em;
  left: 10vw;
  bottom: 0;
`;

export type TopicAggHeroProps = {
  image?: {
    id: string;
    image: string;
    thumbnail: string;
  } | null;
  heading?: string;
  blurb?: string;
};
export const TopicAggHero: React.FC<TopicAggHeroProps> = ({ image, heading, blurb }) => {
  return (
    <TopicHeroWrapper>
      <BackgroundImage style={{ backgroundImage: `url("${image?.image}")` }} />
      <TextBox>
        <TopWrapper>
          <HeroHeading>{heading}</HeroHeading>
          <TextButton>
            <Share /> Share
          </TextButton>
        </TopWrapper>
        <HeroSubHeading>{blurb}</HeroSubHeading>
        <Button>See all within this section</Button>
      </TextBox>
    </TopicHeroWrapper>
  );
};

blockEditorFor(TopicAggHero, {
  type: 'topic-agg-hero',
  label: 'Topic aggregation Hero',
  anyContext: [],
  defaultProps: {
    image: null,
    heading: '',
    blurb: '',
  },
  editor: {
    image: { label: 'Image', type: 'madoc-media-explorer' },
    heading: { label: 'Enter a heading', type: 'text-field' },
    blurb: { label: 'Enter a blurb', type: 'text-field' },
  },
});
