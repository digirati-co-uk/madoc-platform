import React, { useState } from 'react';
import styled, { css } from 'styled-components';
import { InputBorderless } from '../form/Input';
import { Button, LinkButton } from '../navigation/Button';
import { CloseIcon } from '../icons/CloseIcon';
import { useTranslation } from 'react-i18next';
import { Simulate } from 'react-dom/test-utils';
import submit = Simulate.submit;

const SearchContainer = styled.div<{ $isFocus?: boolean; $isAdmin?: boolean }>`
  padding: 0.2em 0.4em;
  margin: 0 0.2em;
  font-size: 0.85em;
  border-radius: 5px;
  display: flex;
  border: 1px solid #370b0b;
  line-height: 1.3em;
  width: 100%;
  max-width: 700px;
  min-width: 500px;
  box-shadow: none;
  &:focus {
    border-color: #333;
    outline: none;
  }

  ${props =>
    props.$isAdmin &&
    css`
      color: #fff;
      background: #5d80ae;

      ${InputBorderless} {
        color: #fff;

        &:focus {
          color: #000;
        }

        &::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
      }
    `}

  ${props =>
    props.$isFocus &&
    css`
      background: #fff;
    `}
`;

export const SearchBox: React.FC<{
  isAdmin?: boolean;
  onSearch: (val: string) => void;
  placeholder?: string;
  large?: boolean;
  value?: string;
}> = ({ isAdmin, onSearch, placeholder = 'Search', large = false, value = '' }) => {
  const [isFocus, setIsFocus] = useState(false);
  const [searchValue, setSearchValue] = useState(value);
  const { t } = useTranslation();
  return (
    <form
      style={{ marginRight: '20px', display: 'flex' }}
      onSubmit={ev => {
        ev.preventDefault();
        onSearch(searchValue);
      }}
    >
      <SearchContainer $isFocus={isFocus} $isAdmin={isAdmin}>
        <InputBorderless
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          type="text"
          id={!large ? 'search' : `searchLarge`}
          value={searchValue}
          onChange={(e: any) => setSearchValue(e.target.value)}
          placeholder={placeholder}
        />
        <LinkButton onClick={() => setSearchValue('')} style={{ display: 'flex', alignItems: 'center' }}>
          <CloseIcon style={{ fill: '#333', height: '18px' }} />
        </LinkButton>
      </SearchContainer>
      <Button $primary type={'submit'}>
        {t('Search')}
      </Button>
    </form>
  );
};
