import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useCreateLocaleString } from '../../shared/components/LocaleString';
import { useTranslation } from 'react-i18next';
import { Carousel } from '../../shared/atoms/Carousel';
import { useTopicType } from '../pages/loaders/topic-type-loader';
import { TopicSnippetCard } from '../../shared/components/TopicSnippet';

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
  controlcolor?: string;
}> = ({ cardBackground = '#ffffff', textColor = '#002D4B', cardBorder = '#002D4B', controlcolor = '#002D4B'  }) => {
  const { data } = useTopicType();
  // todo change when backend has featured items
  // const items = data?.featured_items ? data?.featured_items : [];
  const items = [data?.topics[0], data?.topics[1], data?.topics[2]];

  if (!data) {
    return null;
  }
  const Items = items?.map(item => {
    return (
      item && (
        <Link key={item.id} to={item.url}>
          <TopicSnippetCard
            topic={item}
            cardBorder={cardBorder}
            textColor={textColor}
            background={cardBackground}
          />
        </Link>
      )
    );
  });

  if (!items || items.length === 0) {
    return null;
  }
  return (
    <>
      <h3 style={{ fontSize: '1.5em', color: textColor, textAlign: 'center' }}>Featured in: {data.label}</h3>
      <FeaturesContainer>
        <Carousel controlColor={controlcolor}>{Items}</Carousel>
      </FeaturesContainer>
    </>
  );
}

blockEditorFor(FeaturedTopics, {
  label: 'Featured Topics',
  type: 'default.FeaturedTopics',
  defaultProps: {
    cardBackground: '',
    textColor: '',
    cardBorder: '',
    controlColor: '',
  },
  editor: {
    cardBackground: { label: 'Card background color', type: 'color-field' },
    textColor: { label: 'Card text color', type: 'color-field' },
    cardBorder: { label: 'Card border', type: 'color-field' },
    controlColor: { label: 'Carousel control colours', type: 'color-field' },
  },
  anyContext: ['topic'],
  requiredContext: ['topic'],
});
