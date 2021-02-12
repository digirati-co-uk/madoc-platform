import styled, { css } from 'styled-components';

export const SearchFilterContainer = styled.div`
  width: 100%;
  padding-right: 1em;
`;

export const SearchFilterCheckbox = styled.div`
  padding: 0.1em;
  background: #eee;
`;

export const SearchFilterTitle = styled.h3``;

export const SearchFilterLabel = styled.label`
  flex: 1 1 0px;
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  font-size: 0.8em;
  padding: 0.5em;
`;

export const SearchFilterItem = styled.div<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  margin-bottom: 1px;
  padding: 0 0.4em;
  ${props =>
    props.$selected &&
    css`
      ${SearchFilterLabel} {
        font-weight: bold;
      }
    `}
`;

export const SearchFilterItemList = styled.div`
  background: #fff;
  //height: 0;
  overflow: hidden;
`;

export const SearchFilterButton = styled.button`
  background: red;
`;

export const SearchFilterToggle = styled.button`
  background: #eee;
  padding: 0.2em 0.5em;
  border: none;
  color: #000;
  cursor: pointer;
  &:hover {
    background: #ccc;
  }
`;

export const SearchFilterItemCount = styled.div`
  padding: 0.2em 0.4em;
  text-align: center;
  font-size: 0.7em;
  border-radius: 5px;
  margin-right: 0.4em;
  background: #eee;
  color: #555;
`;

export const SearchFilterSection = styled.div`
  margin-bottom: 0.5em;
`;

export const SearchFilterSectionTitle = styled.div`
  font-size: 0.85em;
  font-weight: bold;
  padding: 0.5em;
  //border-bottom: 1px solid #ddd;
`;
