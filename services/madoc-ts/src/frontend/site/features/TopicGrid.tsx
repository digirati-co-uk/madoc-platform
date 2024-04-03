import { ImageGrid } from '../../shared/atoms/ImageGrid';
import { Link, useHref, useLocation, useNavigate } from 'react-router-dom';
import React, { useLayoutEffect, useState } from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { useTopicType } from '../pages/loaders/topic-type-loader';
import { TopicCard } from '../../shared/components/TopicCard';
import { Dropdown } from '../../shared/capture-models/editor/atoms/Dropdown';
import styled from 'styled-components';
import { useRouteContext } from '../hooks/use-route-context';

const DropdownContainer = styled.div`
  margin: 1em 1em 1em 0;
  font-size: 0.9em;
  font-weight: 400;
  width: 250px;
  margin-left: auto;
  & strong {
    font-size: 0.9em;
    font-weight: 400;
  }
`;

export const TopicGrid: React.FC<{
  background?: string;
  textColor?: string;
  cardBorder?: string;
  imageStyle?: string;
}> = ({ background, textColor, cardBorder }) => {
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;

  useLayoutEffect(() => {
    window.scrollTo(scrollX, scrollY);
  });

  const { data } = useTopicType();
  const items = data?.topics;
  const createLink = useRelativeLinks();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  if (!data) {
    return null;
  }

  return (
    <div style={{ margin: '4em' }}>
      <DropdownContainer>
        <Dropdown
          key={'fulltext'}
          placeholder={`sort by`}
          value={''}
          onChange={val => {
            const page = 1;
            navigate(`${pathname}?page=${page}&order_by=${val}`, { resetScroll: false, replace: true });
          }}
          options={[
            {
              value: '',
              text: 'Appearances',
            },
            {
              value: 'label',
              text: 'Alphabetical',
            },
          ]}
        />
      </DropdownContainer>
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
    background: '#ffffff',
    textColor: '#002D4B',
    cardBorder: '#002D4B',
  },
  editor: {
    background: { label: 'Card background color', type: 'color-field' },
    textColor: { label: 'Card text color', type: 'color-field' },
    cardBorder: { label: 'Card border', type: 'color-field' },
  },
});
