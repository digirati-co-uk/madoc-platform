import { stringify } from 'query-string';
import React from 'react';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { Button, ButtonIcon } from '../../shared/atoms/Button';
import { useLocationQuery } from '../../shared/hooks/use-location-query';
import { FilterIcon } from '../../shared/icons/FilterIcon';

const ItemFilterContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const ItemFilterPopupContainer = styled.div<{ $visible?: boolean }>`
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.14);
  border-radius: 4px;

  position: absolute;
  display: none;
  padding: 0.3em;
  right: 0;
  top: 2.8em;
  font-size: 0.9em;
  min-width: 10em;
  ${props =>
    props.$visible &&
    css`
      display: block;
    `}
`;

export const ItemFilterPopupItem = styled.label`
  display: block;
  color: #000;
  text-decoration: none;
  padding: 0.4em 0.75em;
  &:hover,
  &:focus {
    outline: none;
  }
`;

export const ManifestItemFilter: React.FC = () => {
  const { filter, m: page, listing } = useLocationQuery();
  const { location, push } = useHistory();
  const { t } = useTranslation();

  const numericFilters = filter
    ? (`${filter}`
        .split(',')
        .map((str: string) => Number(str))
        .filter((b: number) => !Number.isNaN(b)) as number[])
    : [];

  const { buttonProps, itemProps, isOpen } = useDropdownMenu(3);

  const toggleStatus = (filterNumber: number) => (e: any) => {
    if (e.target.checked) {
      const newFilters = numericFilters.filter(n => n !== filterNumber);
      push(
        `${location.pathname}?${stringify({
          page,
          listing,
          filter: newFilters.length ? newFilters.join(',') : undefined,
        })}`
      );
    } else {
      push(
        `${location.pathname}?${stringify({
          page,
          listing,
          filter: [...numericFilters, filterNumber].join(','),
        })}`
      );
    }
  };

  return (
    <ItemFilterContainer style={{ marginLeft: '.5em' }}>
      <Button {...buttonProps}>
        <ButtonIcon>
          <FilterIcon />
        </ButtonIcon>
        {t('Filter images')}
      </Button>
      <ItemFilterPopupContainer $visible={isOpen} role="menu">
        <ItemFilterPopupItem {...(itemProps[1] as any)}>
          <input type="checkbox" checked={numericFilters.indexOf(2) === -1} onChange={toggleStatus(2)} />{' '}
          {t('In progress')}
        </ItemFilterPopupItem>
        <ItemFilterPopupItem {...(itemProps[2] as any)}>
          <input type="checkbox" checked={numericFilters.indexOf(3) === -1} onChange={toggleStatus(3)} />{' '}
          {t('Completed')}
        </ItemFilterPopupItem>
      </ItemFilterPopupContainer>
    </ItemFilterContainer>
  );
};
