import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRouteContext } from '../../site/hooks/use-route-context';
import { useCanvasSearch } from '../hooks/use-canvas-search';
import { useManifestStructure } from '../hooks/use-manifest-structure';
import { createLink } from '../utility/create-link';
import styled, { css } from 'styled-components';
import { ItemStructureListItem } from '../../../types/schemas/item-structure-list';
import { DownArrowIcon } from '../icons/DownArrowIcon';
import { HrefLink } from '../utility/href-link';

const PaginationButton = styled.button`
  padding: 0.1rem;
  border: 1px solid #6c757d;
  border-radius: 3px;
  background-color: white;
  margin: 0.5rem;
  &:hover {
    background-color: #eee;
  }
`;

export const PaginationContainer = styled.div<{ $size?: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${props =>
    props.$size === 'small' &&
    css`
      width: 250px;
      border: 1px solid #6c757d;
      padding: 0;
      margin-left: auto;
      button {
        border: none;
      }
    `}
`;

export const PaginationText = styled.div`
  white-space: nowrap;
  font-size: 0.85em;
  margin: 0 0.5em;
`;

export const NavigationButton: React.FC<{
  label?: string;
  link: string;
  alignment?: 'left' | 'right';
  onClick?: (e: React.PointerEvent) => void;
  item: ItemStructureListItem;
}> = props => {
  return (
    <PaginationButton>
      <HrefLink href={props.link} onClick={props.onClick}>
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

export function useManifestPagination(subRoute?: string) {
  const { manifestId, collectionId, canvasId, projectId } = useRouteContext();
  const [searchText] = useCanvasSearch(canvasId);
  const structure = useManifestStructure(manifestId);
  const query = searchText ? { searchText } : undefined;

  const idx = structure.data && canvasId ? structure.data.ids.indexOf(canvasId) : -1;

  if (!structure.data || idx === -1 || !manifestId) {
    return null;
  }

  const hasPrevPage = idx > 0 && structure.data.items[idx - 1];
  const hasNextPage = idx < structure.data.items.length && structure.data.items[idx + 1];

  return {
    hasPrevPage: !!hasPrevPage,
    prevItem: hasPrevPage,
    prevPage: hasPrevPage
      ? createLink({
          projectId,
          collectionId,
          manifestId,
          canvasId: structure.data.items[idx - 1].id,
          subRoute,
          query,
        })
      : undefined,

    hasNextPage: !!hasNextPage,
    nextItem: hasNextPage,
    nextPage: hasNextPage
      ? createLink({
          projectId,
          collectionId,
          manifestId,
          canvasId: structure.data.items[idx + 1].id,
          subRoute,
          query,
        })
      : undefined,
  };
}

export const CanvasNavigationMinimalist: React.FC<{
  hash?: string;
  handleNavigation?: (canvasId: number) => Promise<void> | void;
  canvasId: string | number;
  manifestId?: string | number;
  projectId?: string | number;
  collectionId?: string | number;
  subRoute?: string;
  query?: any;
  size?: string | undefined;
}> = ({ canvasId: id, manifestId, projectId, collectionId, subRoute, query, handleNavigation, hash, size }) => {
  const structure = useManifestStructure(manifestId);
  const { t } = useTranslation();

  const idx = structure.data ? structure.data.ids.indexOf(Number(id)) : -1;

  if (!structure.data || idx === -1 || !manifestId) {
    return null;
  }

  return (
    <PaginationContainer style={{ display: 'flex' }} $size={size}>
      {idx > 0 ? (
        <NavigationButton
          alignment="left"
          onClick={e => {
            if (handleNavigation) {
              e.preventDefault();
              if (structure.data) {
                handleNavigation(structure.data.items[idx - 1].id);
              }
            }
          }}
          link={createLink({
            projectId,
            collectionId,
            manifestId,
            canvasId: structure.data.items[idx - 1].id,
            subRoute,
            query,
            hash,
          })}
          item={structure.data.items[idx - 1]}
        />
      ) : null}
      {
        <PaginationText>
          {t('Page {{page}} of {{count}}', {
            page: idx + 1,
            count: structure.data.items.length > 1 ? structure.data.items.length : 1,
          })}
        </PaginationText>
      }
      {idx < structure.data.items.length - 1 ? (
        <NavigationButton
          alignment="right"
          onClick={e => {
            if (handleNavigation) {
              e.preventDefault();
              if (structure.data) {
                handleNavigation(structure.data.items[idx + 1].id);
              }
            }
          }}
          link={createLink({
            projectId,
            collectionId,
            manifestId,
            canvasId: structure.data.items[idx + 1].id,
            subRoute,
            query,
            hash,
          })}
          item={structure.data.items[idx + 1]}
        />
      ) : null}
    </PaginationContainer>
  );
};
