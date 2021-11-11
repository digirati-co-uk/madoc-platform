import { useEffect, useState } from 'react';
import * as React from 'react';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';
import styled, { css } from 'styled-components';
import { _Input, Input } from '../form/Input';
import {
  ContextualMenuList,
  ContextualMenuListItem,
  ContextualMenuWrapper,
  ContextualPositionWrapper,
} from '../navigation/ContextualMenu';

const OrderByContainer = styled.div<{ $maxWidth?: boolean }>`
  padding: 1em 0;
  display: flex;
  align-items: center;
  margin-bottom: 1em;

  ${props =>
    props.$maxWidth &&
    css`
      max-width: 800px;
      margin: 0 auto 1em auto;
    `}
`;

const OrderByLabel = styled.div`
  font-weight: 600;
  margin-right: 0.5em;
`;

const OrderByButton = styled.button`
  font-size: 1em;
  background: none;
  border: none;
  margin: 0;
  background: rgba(255, 255, 255, 0.5);
  &:hover {
    background: #fff;
  }
  cursor: pointer;
  padding: 0.2em 0.4em;
  border-radius: 3px;
`;

const OrderBySpacer = styled.div`
  flex: 1 1 0px;
  display: block;
`;

const OrderBySearchContainer = styled.div`
  display: flex;
  width: 300px;
  align-items: center;

  ${_Input} {
    padding: 0.3em;
    margin-right: 0.4em;
  }
`;

export const SystemOrderBy: React.FC<{
  initialValue?: string;
  initialDesc?: string;
  items: Array<string>;
  maxWidth?: boolean;
  onChange?: (opt: { value: string | null; desc: boolean }) => void;
  initialSearch?: string;
  liveSearch?: boolean;
  onSearch?: (query: string) => void;
}> = props => {
  const [currentSearch, setCurrentSearch] = useState(props.initialSearch || '');
  const [currentValue, setCurrentValue] = useState(props.initialValue || 'none');
  const [isDescending, setIsDesc] = useState(!!props.initialDesc);
  const { isOpen, buttonProps, itemProps } = useDropdownMenu(props.items.length + 1);

  useEffect(() => {
    if (props.onChange) {
      props.onChange({ value: currentValue === 'none' ? null : currentValue, desc: isDescending });
    }
  }, [currentValue, isDescending]);

  return (
    <OrderByContainer $maxWidth={props.maxWidth}>
      <OrderByLabel>Order By</OrderByLabel>
      <ContextualPositionWrapper>
        <OrderByButton {...buttonProps}>{currentValue || 'none'}</OrderByButton>
        <ContextualMenuWrapper $padding $isOpen={isOpen}>
          <ContextualMenuList>
            <ContextualMenuListItem onClick={() => setCurrentValue('none')}>none</ContextualMenuListItem>
            {props.items.map((availableSort, n) => (
              <ContextualMenuListItem key={n + 1} onClick={() => setCurrentValue(availableSort)} {...itemProps[n]}>
                {availableSort}
              </ContextualMenuListItem>
            ))}
          </ContextualMenuList>
        </ContextualMenuWrapper>
      </ContextualPositionWrapper>
      <div style={{ width: '2em' }} />
      {currentValue !== 'none' ? (
        <>
          <OrderByLabel>Sort</OrderByLabel>
          <OrderByButton onClick={() => setIsDesc(d => !d)}>{isDescending ? 'Descending' : 'Ascending'}</OrderByButton>
        </>
      ) : null}

      {props.onSearch ? (
        <>
          <OrderBySpacer />
          <OrderBySearchContainer>
            <OrderByLabel>Search</OrderByLabel>
            <Input
              type="text"
              onChange={e => {
                if (props.onSearch && props.liveSearch) {
                  props.onSearch(e.currentTarget.value);
                }
                setCurrentSearch(e.currentTarget.value);
              }}
              value={currentSearch}
            />
            {props.liveSearch ? null : (
              <OrderByButton
                onClick={() => {
                  if (props.onSearch) {
                    props.onSearch(currentSearch);
                  }
                }}
              >
                Apply
              </OrderByButton>
            )}
          </OrderBySearchContainer>
        </>
      ) : null}
    </OrderByContainer>
  );
};
