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
