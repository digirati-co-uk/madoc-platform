import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-react';
import React from 'react';
import styled from 'styled-components';

const TopicHeroWrapper = styled.div`
  color: #002d4b;
  position: relative;
  margin-right: -2em;
  padding-left: 3em;

  img {
    position: absolute;
    top: -1em;
    right: 0;
    max-height: 500px;
    aspect-ratio: 1 / 1;
    clip-path: circle(67% at 100% 40%);
  }

  h1 {
    font-size: 48px;
    line-height: 56px;
    font-weight: 700;
    max-width: 40vw;
    margin: 0;
  }

  h2 {
    font-size: 28px;
    line-height: 36px;
    font-weight: 600;
    max-width: 50vw;
    margin: 0;
  }
`;

const Blurb = styled.p`
  font-size: 22px;
  line-height: 30px;
  font-weight: 500;
  max-width: 40vw;
`;
const Desc = styled.p`
  font-size: 20px;
  line-height: 28px;
  max-width: 40vw;
`;

export type TopicHeroProps = {
  image?: {
    id: string;
    image: string;
    thumbnail: string;
  } | null;
  heading?: string;
  blurb?: string;
  contributions?: boolean;
  subHeading?: string;
  description?: string;
};
export const TopicHero: React.FC<TopicHeroProps> = ({
  image,
  heading,
  blurb,
  subHeading,
  description,
  contributions,
}) => {
  return (
    <TopicHeroWrapper>
      {image ? <img src={image.image} alt="" /> : null}
      <h1>{heading}</h1>
      <Blurb>{blurb}</Blurb>

      {contributions && <p>CONTRIBUTIONS BY ... ... ... .. </p>}

      <h2>{subHeading}</h2>
      <Desc>{description}</Desc>

      <span>share this page </span>
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
