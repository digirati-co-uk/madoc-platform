import { ImageGrid } from '../../shared/atoms/ImageGrid';
import { Link } from 'react-router-dom';
import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useTopicType } from '../pages/loaders/topic-type-loader';
import { TopicCard } from '../../shared/components/TopicCard';

export const TopicGrid: React.FC<{
  background?: string;
  textColor?: string;
  cardBorder?: string;
  imageStyle?: string;
}> = ({ background = '#ffffff', textColor = '#002D4B', cardBorder = '#002D4B' }) => {
  const { data } = useTopicType();
  const items = data?.topics;
  const createLink = useRelativeLinks();
  if (!data) {
    return null;
  }

  return (
    <div style={{ margin: '4em' }}>
      <ImageGrid $size="large">
        {items?.map(topic => (
          <Link
            key={topic.id}
            to={createLink({
              topic: topic.slug,
            })}
          >
            <TopicCard topic={topic} cardBorder={cardBorder} textColor={textColor} background={background} />
          </Link>
        ))}
      </ImageGrid>
    </div>
  );
};
blockEditorFor(TopicGrid, {
  type: 'default.TopicGrid',
  label: 'Topic Grid',
  anyContext: ['topicType'],
  requiredContext: ['topicType'],
  defaultProps: {
    background: '',
    textColor: '',
    cardBorder: '',
  },
  editor: {
    background: { label: 'Card background color', type: 'color-field' },
    textColor: { label: 'Card text color', type: 'color-field' },
    cardBorder: { label: 'Card border', type: 'color-field' },
  },
});
