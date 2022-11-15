import React from 'react';
import { Tiles } from '../../shared/atoms/tiles';
import styled from 'styled-components';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { LocaleString } from '../../shared/components/LocaleString';
import { useCollectionList } from '../hooks/use-collection-list';

export const TileWrapper = styled.div`
  padding: 50px;

  @media (max-width: 600px) {
    padding: 20px;
  }
`;

export const SectionTitle = styled.h3`
  font-size: 36px;
  margin: 30px 0;
  text-transform: capitalize;

  //mobile
  @media (max-width: 600px) {
    text-align: center;
  }
`;

export const TileSection = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fill, 240px);
  grid-template-rows: repeat(4, auto);
  justify-content: space-between;
  grid-row-gap: 10px;

  //tablet
  @media (max-width: 850px) {
    justify-content: space-evenly;
  }

  //mobile table
  @media (max-width: 500px) {
    grid-template-columns: repeat(1, auto);
    justify-content: center;
  }

  //extra large
  @media (min-width: 1600px) {
    grid-template-columns: repeat(6, auto);
    grid-template-rows: repeat(2, auto);
  }
`;

export const ProjectTiles: React.FC<{ type?: string }> = ({ type }) => {
  const { resolvedData: data } = useCollectionList();

  console.log(data)
  const handleLink = () => {
    console.log('go somewhere');
  };

  return (
    <TileWrapper>
      <SectionTitle>Collections</SectionTitle>
      <TileSection>
        {data?.collections.map(collection => (
          <Tiles
            key={collection.id}
            type={type}
            image={collection.thumbnail}
            title={<LocaleString>{collection.label || { en: ['...'] }}</LocaleString>}
            onClick={handleLink}
            linkTitle={`${collection.itemCount} items`}
            subTitle={collection.type}
            published={collection.published}
          />
        ))}
      </TileSection>
    </TileWrapper>
  );
};

blockEditorFor(ProjectTiles, {
  type: 'default.ProjectTiles',
  label: 'Project tiles',
  anyContext: [],
  defaultProps: {
    type: 'tile',
  },
  editor: {
    type: {
      label: 'Tiles Type',
      type: 'dropdown-field',
      options: [
        { value: 'tile', text: 'Tile' },
        { value: 'brick', text: 'Brick' },
        { value: 'card', text: 'Card' },
      ],
    },
  },
});
