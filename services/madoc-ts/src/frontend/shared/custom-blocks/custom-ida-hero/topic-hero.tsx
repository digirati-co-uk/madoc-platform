import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-react';
import React from 'react';
import styled from 'styled-components';
import { Share } from '@styled-icons/entypo/Share';
import { HeroHeading, HeroSubHeading, HeroHeading2, HeroSubHeading2 } from './custom-ida-hero.style';
import { TextButton } from '../../custom-components/Button/Button';

const TopicHeroWrapper = styled.div`
  color: #002d4b;
  margin-right: -4em;
  padding-left: 4em;
  display: flex;
  justify-content: space-between;

  h1,
  p {
    max-width: 30vw;
  }
  h2 {
    max-width: 50vw;
  }
`;
const ImageMask = styled.div`
  height: 450px;
  width: 450px;
  border-radius: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: right;
`;
const Right = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: -2em;
`;

export type TopicHeroProps = {
  image?: {
    id: string;
    image: string;
    thumbnail: string;
  } | null;
  heading?: string;
  blurb?: string;
  subHeading?: string;
  description?: string;
};
export const TopicHero: React.FC<TopicHeroProps> = ({ image, heading, blurb, subHeading, description }) => {
  return (
    <TopicHeroWrapper>
      <div>
        <HeroHeading>{heading}</HeroHeading>
        <HeroSubHeading>{blurb}</HeroSubHeading>

        <HeroHeading2>{subHeading}</HeroHeading2>
        <HeroSubHeading2>{description}</HeroSubHeading2>
      </div>
      <Right>
        <ImageMask style={{ backgroundImage: `url("${image?.image}")` }} />
        <TextButton>
          <Share /> Share this page
        </TextButton>
      </Right>
    </TopicHeroWrapper>
  );
};

blockEditorFor(TopicHero, {
  type: 'topic-hero',
  label: 'Topic Hero (ida)',
  anyContext: [],
  defaultProps: {
    image: null,
    heading: '',
    blurb: '',
    contributions: true,
    subHeading: '',
    description: '',
  },
  editor: {
    image: { label: 'Image', type: 'madoc-media-explorer' },
    heading: { label: 'Enter a heading', type: 'text-field' },
    blurb: { label: 'Enter a blurb', type: 'text-field' },
    contributions: { label: 'contributions', type: 'checkbox-field', inlineLabel: 'Show contributions' },
    subHeading: { label: 'Enter a subheading', type: 'text-field' },
    description: { label: 'Enter a description', type: 'text-field' },
  },
});
