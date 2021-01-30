import * as React from 'react';
import styled, { css } from 'styled-components';
import { SmallButton } from './Button';
import { CloseIcon } from './CloseIcon';
import { InputLabel } from './Input';

export const MetadataCardListContainer = styled.div<{ isOver?: boolean; canDrop?: boolean }>`
  display: flex;
  flex-direction: column;
  padding: 1em;
  min-height: 500px;
  ${props =>
    props.canDrop &&
    css`
      background: #d2f3da;
    `}
`;

export const MetadataCardItem = styled.div`
  margin-bottom: 1em;
  border: 1px solid #ddd;
  display: flex;
  background: #fff;
`;

export const MetadataCardLabel = styled.div`
  font-size: 1em;
`;

export const MetadataCardSubtext = styled.div`
  color: #999;
  font-size: 0.8em;
`;

export const MetadataCard = styled.div<{ interactive?: boolean }>`
  padding: 1em;
  flex: 1 1 0px;
  ${props =>
    props.interactive &&
    css`
      cursor: pointer;
      //&:hover {
      //  background: #e0ecff;
      //}
    `}
`;

export const MetadataCardRemoveLabel = styled.div`
  margin-left: 0.5em;
`;

export const MetadataCardRemove = styled.div`
  display: flex;
  align-items: center;
  padding: 1em;
  font-size: 0.8em;
  cursor: pointer;
  &:hover {
    background: #eee;
  }
`;

export const MetadataDropzone = styled.div`
  //background: #ddd;
  padding: 1em;
  border: 2px dashed #ccc;
  text-align: center;
  color: #666;
  font-size: 0.8em;
  cursor: pointer;
`;

export const MetadataListContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-top: 1px solid #ddd;
`;

export const MetadataListItemContainer = styled.div`
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  background: #fff;
`;

export const MetadataListItemIcon = styled.div`
  padding: 0.5em;
  cursor: grab;
`;

export const MetadataListItemLabel = styled.div`
  flex: 1 1 0px;
  font-size: 0.85em;
  font-weight: bold;
  margin-left: 0.5em;
`;

export const MetadataListItemSubtitle = styled.div`
  color: #999;
  font-size: 0.75em;
`;

export const MetadataListItemChildren = styled.div`
  padding-left: 1.5em;
  border-bottom: 1px solid #ddd;
  ${MetadataListItemContainer} {
    border-bottom: none;
  }
`;

export const MetadataListItemCollapse = styled.div`
  padding: 0.5em;
  min-width: 2em;
  text-align: center;
  cursor: pointer;
  &:hover {
    background: #eee;
  }
`;

export const MetadataInputLabel = styled(InputLabel)`
  margin: 0.5em 0;
  display: block;
`;

export const MetadataEmbeddedList = styled.div<{ canDrop?: boolean }>`
  background: #eee;
  padding: 1em;
  border: 1px solid #ccc;

  ${props =>
    props.canDrop &&
    css`
      background: #d2d9c5;
    `}
`;

export const MetadataEmptyState = styled.div`
  text-align: center;
  color: #666;
  font-size: 0.8em;
`;

export const TableHandleIcon: React.FC<{ className: string } & any> = ({ className, ...props }) => (
  <div className={className} {...props}>
    <svg width="17px" height="11px" viewBox="0 0 17 11" version="1.1">
      <title>Handle</title>
      <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Compact-item" transform="translate(-10.000000, -10.000000)">
          <rect id="Rectangle" stroke="#B1B1B1" x="0.5" y="0.5" width="1197" height="29" />
          <g id="Handle" transform="translate(10.000000, 10.000000)" stroke="#979797" strokeLinecap="square">
            <line x1="16.5" y1="0.5" x2="0.5" y2="0.5" id="Line-5" />
            <line x1="16.5" y1="5.5" x2="0.5" y2="5.5" id="Line-5" />
            <line x1="16.5" y1="10.5" x2="0.5" y2="10.5" id="Line-5" />
          </g>
        </g>
      </g>
    </svg>
  </div>
);

export const FacetEditContainer = styled.div`
  background: #fff;
  padding: 1em;
  border: 1px solid #ddd;
  margin-bottom: 1em;
`;

export const FacetEditBack = styled(SmallButton)`
  margin-right: auto;
  display: flex;
  align-items: center;
`;

export const FacetEditRemove = styled.div`
  margin-left: auto;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0.5em 1em 0.5em 0.5em;

  &:hover {
    background: #eee;
  }

  ${CloseIcon} {
    margin-right: 0.5em;
  }
`;

export const FacetEditActions = styled.div`
  display: flex;
  align-items: center;
`;
