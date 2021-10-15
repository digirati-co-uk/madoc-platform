import React from 'react';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';
import styled, { css } from 'styled-components';
import { Button, ButtonIcon } from '../navigation/Button';
import { FilterIcon } from '../icons/FilterIcon';

export const ItemFilterContainer = styled.div`
  position: relative;
  display: inline-block;
`;

export const ItemFilterPopupContainer = styled.div<{ $visible?: boolean; $alignLeft?: boolean }>`
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.14);
  border-radius: 4px;
  z-index: 11;
  position: absolute;
  display: none;
  padding: 0.3em;
  top: 2.8em;
  font-size: 0.9em;
  min-width: 10em;
  ${props =>
    props.$visible &&
    css`
      display: block;
    `}

  ${props =>
    !props.$alignLeft &&
    css`
      right: 0;
    `}
`;

export const ItemFilterPopupItem = styled.label`
  display: block;
  color: #000;
  text-decoration: none;
  padding: 0.4em 0.75em;
  white-space: nowrap;
  &:hover,
  &:focus {
    outline: none;
  }
`;

type ItemFilterType = {
  label: any;
  type?: 'checkbox' | 'radio';
  items: Array<{
    id: any;
    label: any;
    onChange: (checked: boolean) => void;
  }>;
  selected: any[];
  closeOnChange?: boolean;
};

export const ItemFilter: React.FC<ItemFilterType> = ({
  type = 'checkbox',
  label,
  items,
  selected,
  closeOnChange = true,
}) => {
  const { buttonProps, itemProps, isOpen, setIsOpen } = useDropdownMenu(items.length);

  return (
    <ItemFilterContainer>
      <Button {...buttonProps}>
        <ButtonIcon>
          <FilterIcon />
        </ButtonIcon>
        {label}
      </Button>
      <ItemFilterPopupContainer $visible={isOpen} role="menu">
        {items.map(item => {
          return (
            <ItemFilterPopupItem key={item.id} {...(itemProps[1] as any)}>
              <input
                type={type}
                checked={selected.indexOf(item.id) !== -1}
                onChange={e => {
                  item.onChange(e.target.checked);
                  if (!closeOnChange) {
                    setIsOpen(false);
                  }
                }}
              />{' '}
              {item.label}
            </ItemFilterPopupItem>
          );
        })}
      </ItemFilterPopupContainer>
    </ItemFilterContainer>
  );
};
