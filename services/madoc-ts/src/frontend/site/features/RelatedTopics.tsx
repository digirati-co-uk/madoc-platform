import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useTopic } from '../pages/loaders/topic-loader';
import { TopicCard } from '../../shared/components/TopicCard';
import { useTranslation } from 'react-i18next';

const RelatedWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
const RelatedContainer = styled.div`
  align-self: center;
  display: flex;
  margin: 1em;
  justify-content: space-around;
  align-content: center;
  width: calc(325px * 3 + 6em);

  a {
    text-decoration: none;
    width: 325px;
  }
`;

export const RelatedTopics: React.FC<{
  cardBackground?: string;
  textColor?: string;
  cardBorder?: string;
  controlColor?: string;
}> = ({ cardBackground, textColor, cardBorder }) => {
  const { data } = useTopic();
  const createLink = useRelativeLinks();
  const { t } = useTranslation();
  const items = data?.related_topics ? data?.related_topics : [];

  if (!data) {
    return null;
  }
  if (!items || items.length === 0) {
    return null;
  }
  return (
    <RelatedWrapper>
      <h3 style={{ fontSize: '1.5em', color: textColor, textAlign: 'center' }}>{t('Related topics')}</h3>
      <RelatedContainer>
        {items?.map(
          item =>
            item && (
              <Link
                key={item.id}
                to={createLink({
                  topic: item.slug,
                })}
              >
                <TopicCard topic={item} cardBorder={cardBorder} textColor={textColor} background={cardBackground} />
              </Link>
            )
        )}
      </RelatedContainer>
    </RelatedWrapper>
  );
};

blockEditorFor(RelatedTopics, {
  label: 'Related Topics',
  type: 'default.RelatedTopics',
  defaultProps: {
    cardBackground: '',
    textColor: '#002D4B',
    cardBorder: '#002D4B',
  },
  editor: {
    cardBackground: { label: 'Card background color', type: 'color-field' },
    textColor: { label: 'Card text color', type: 'color-field' },
    cardBorder: { label: 'Card border', type: 'color-field' },
  },
  anyContext: ['topic'],
  requiredContext: ['topic'],
});
