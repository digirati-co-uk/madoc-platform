import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Carousel } from '../../shared/atoms/Carousel';
import { useTopicType } from '../pages/loaders/topic-type-loader';
import { TopicSnippetCard } from '../../shared/components/TopicSnippet';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { LocaleString } from '../../shared/components/LocaleString';

const FeaturesContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-content: center;
  a {
    text-decoration: none;
    width: 100%;
  }
`;

export const FeaturedTopics: React.FC<{
  cardBackground?: string;
  textColor?: string;
  cardBorder?: string;
  controlColor?: string;
}> = ({ cardBackground, textColor, cardBorder, controlColor }) => {
  const { data } = useTopicType();
  const createLink = useRelativeLinks();
  const items = data?.featured_topics;

  if (!data) {
    return null;
  }

  const Items = items?.map(item => {
    return (
      item && (
        <Link
          key={item.id}
          to={createLink({
            topic: item.slug,
          })}
        >
          <TopicSnippetCard topic={item} cardBorder={cardBorder} textColor={textColor} background={cardBackground} />
        </Link>
      )
    );
  });

  if (!items || items.length === 0) {
    return null;
  }
  return (
    <>
      <h3 style={{ fontSize: '1.5em', color: textColor, textAlign: 'center' }}>
        Featured in: <LocaleString>{data.title}</LocaleString>
      </h3>
      <FeaturesContainer>
        <Carousel controlColor={controlColor}>{Items}</Carousel>
      </FeaturesContainer>
    </>
  );
};

blockEditorFor(FeaturedTopics, {
  type: 'default.FeaturedTopics',
  label: 'Featured Topics',
  anyContext: ['topicType', 'topic'],
  requiredContext: ['topicType'],
  defaultProps: {
    cardBackground: '#ffffff',
    textColor: '#002D4B',
    cardBorder: '#002D4B',
    controlColor: '#002D4B',
  },
  editor: {
    cardBackground: { label: 'Card background color', type: 'color-field' },
    textColor: { label: 'Card text color', type: 'color-field' },
    cardBorder: { label: 'Card border', type: 'color-field' },
    controlColor: { label: 'Carousel control colours', type: 'color-field' },
  },
});
