import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import React, { useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { useTopic } from '../pages/loaders/topic-loader';
import { LocaleString } from '../../shared/components/LocaleString';
import { TextButton } from '../../shared/navigation/Button';

const TopicHeroWrapper = styled.div`
  display: flex;
`;

const HeroText = styled.div`
  display: flex;
  flex-direction: column;

  button {
    width: 100px;
    margin-left: auto;
  }
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
const HeroDescription = styled.div`
  font-size: 1em;
  line-height: 28px;
  font-weight: 400;

  max-height: 300px;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: max-height 0.8s;
  
  &[data-is-expanded='true'] {
    transition: max-height 0.8s;
    display: flex;
    max-height: 999px;
  }
`;

const ImageMask = styled.div`
  height: 400px;
  width: 400px;
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
  const ref = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    const initClamped = el ? el.offsetHeight < el.scrollHeight || el.offsetWidth < el.scrollWidth : false;
    setIsClamped(initClamped);
  }, []);

  if (!data) {
    return null;
  }
  return (
    <TopicHeroWrapper>
      <HeroText>
        <HeroHeading style={{ color: h1Color }} as={LocaleString}>
          {data?.title}
        </HeroHeading>

        <>
          {data.description && (
            <HeroDescription ref={ref} style={{ color: h1Color }} data-is-expanded={isExpanded}>
              <LocaleString>{data.description}</LocaleString>
            </HeroDescription>
          )}
          {isClamped && (
            <TextButton
              style={{ color: '#005D74' }}
              onClick={() => {
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? 'collapse' : 'read more'}
            </TextButton>
          )}
        </>

        {data.other_data?.secondary_heading && (
          <HeroSubHeading style={{ color: h2Color }} as={LocaleString}>
            {data.other_data?.secondary_heading}
          </HeroSubHeading>
        )}

        {data.other_data?.topic_summary && (
          <HeroSummary style={{ color: h2Color }} as={LocaleString}>
            {data.other_data?.topic_summary}
          </HeroSummary>
        )}
      </HeroText>
      <Right>
        {data.other_data?.main_image?.url && (
          <ImageMask style={{ backgroundImage: `url("${data.other_data?.main_image.url}")` }} />
        )}
      </Right>
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
