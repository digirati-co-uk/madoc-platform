import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { LocaleString } from '../../shared/components/LocaleString';
import { useTopicType } from '../pages/loaders/topic-type-loader';
import { TextButton } from '../../shared/navigation/Button';

const TopicHeroWrapper = styled.div`
  margin-left: -2.3em;
  margin-right: -2.3em;
  position: relative;
  //min-height: 600px;
  //max-height: 300px;
  display: flex;
  align-items: end;
  justify-content: center;
  height: auto;
  transition: all 0.8s;
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
export const HeroSubHeading = styled.p`
  padding-top: 1em;
  font-size: 1em;
  line-height: 30px;
  font-weight: 500;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TextBox = styled.div`
  background-color: white;
  position: relative;
  margin-top: 150px;
  width: 80%;
  padding: 4em 6em;
  max-height: 350px;
  height: auto;
  transition: all 0.5s ease-in-out;
  overflow: hidden;

  &[data-is-expanded='true'] {
    transition: all 0.5s ease-in-out;
    max-height: 900px;

    ${HeroSubHeading} {
      display: flex;
    }
  }
`;

export const HeroHeading = styled.h1`
  font-size: 3em;
  line-height: 56px;
  font-weight: 700;
  grid-column: span 7;
  grid-row: row 1;
  margin: 0;
`;

export const TopicTypeHero: React.FC<{ textColor?: string; overlayColor?: string; imageHeight?: string }> = ({
  textColor,
  overlayColor,
  imageHeight,
}) => {
  const { data } = useTopicType();
  const [isExpanded, setIsExpanded] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const desc = Object.keys(data?.description ? data.description : {});
    if (desc && desc.length) {
      const el = ref.current;
      const initClamped = el ? el.offsetHeight < el.scrollHeight || el.offsetWidth < el.scrollWidth : false;
      setIsClamped(initClamped);
    }
  }, [data?.description]);

  if (!data) {
    return null;
  }

  return (
    <TopicHeroWrapper style={{ color: textColor, maxHeight: imageHeight ? `${imageHeight}px` : '400px' }}>
      <BackgroundImage
        $overlay={overlayColor}
        style={{ backgroundImage: `url("${data.other_data?.main_image?.url}")` }}
      />
      <TextBox data-is-expanded={isExpanded}>
        <TopWrapper>
          {data.title?.length ? (
            <HeroHeading as={LocaleString}>{data.title}</HeroHeading>
          ) : (
            <HeroHeading>{data.label}</HeroHeading>
          )}
        </TopWrapper>
        <HeroSubHeading ref={ref}>
          <LocaleString>{data.description}</LocaleString>
        </HeroSubHeading>
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
      </TextBox>
    </TopicHeroWrapper>
  );
};

blockEditorFor(TopicTypeHero, {
  type: 'default.TopicTypeHero',
  label: 'Topic type hero',
  anyContext: ['topicType', 'topic'],
  requiredContext: ['topicType'],
  defaultProps: {
    textColor: '#002d4b',
    overlayColor: '#002d4b',
    imageHeight: '400',
  },
  editor: {
    textColor: { label: 'Heading and summary color', type: 'color-field' },
    overlayColor: { label: 'Overlay color', type: 'color-field' },
    imageHeight: { label: 'Max image height in px', type: 'text-field' },
  },
});
