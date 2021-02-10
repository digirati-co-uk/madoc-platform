import React from 'react';
import { useManifestStructure } from '../hooks/use-manifest-structure';
import { createLink } from '../utility/create-link';
import styled, { css } from 'styled-components';
import { ItemStructureListItem } from '../../../types/schemas/item-structure-list';
import { DownArrowIcon } from '../icons/DownArrowIcon';
import { HrefLink } from '../utility/href-link';

const PaginationButton = styled.button`
  padding: 0.5rem;
  border: 1px solid #6c757d;
  border-radius: 4px;
  background-color: white;
  margin: 0.5rem;
`;

export const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const NavigationButton: React.FC<{
  label?: string;
  link: string;
  alignment?: 'left' | 'right';
  item: ItemStructureListItem;
}> = props => {
  return (
    <PaginationButton>
      <HrefLink href={props.link}>
        {props.item ? (
          <DownArrowIcon
            style={
              props.alignment === 'left'
                ? { transform: 'rotate(90deg)', fill: '#6c757d', width: '22px', height: '23px' }
                : { transform: 'rotate(270deg)', fill: '#6c757d', width: '22px', height: '23px' }
            }
          />
        ) : null}
      </HrefLink>
    </PaginationButton>
  );
};

export const CanvasNavigationMinimalist: React.FC<{
  canvasId: string | number;
  manifestId?: string | number;
  projectId?: string | number;
  collectionId?: string | number;
  subRoute?: string;
  query?: any;
}> = ({ canvasId: id, manifestId, projectId, collectionId, subRoute, query }) => {
  const structure = useManifestStructure(manifestId);

  const idx = structure.data ? structure.data.ids.indexOf(Number(id)) : -1;

  if (!structure.data || idx === -1 || !manifestId) {
    return null;
  }

  return (
    <PaginationContainer style={{ display: 'flex' }}>
      {idx > 0 ? (
        <NavigationButton
          alignment="left"
          link={createLink({
            projectId,
            collectionId,
            manifestId,
            canvasId: structure.data.items[idx - 1].id,
            subRoute,
            query,
          })}
          item={structure.data.items[idx - 1]}
        />
      ) : null}
      {<p>{`${idx + 1} of ${structure.data.items.length > 1 ? structure.data.items.length + 1 : 1}`}</p>}
      {idx < structure.data.items.length - 1 ? (
        <NavigationButton
          alignment="right"
          link={createLink({
            projectId,
            collectionId,
            manifestId,
            canvasId: structure.data.items[idx + 1].id,
            subRoute,
            query,
          })}
          item={structure.data.items[idx + 1]}
        />
      ) : null}
    </PaginationContainer>
  );
};
