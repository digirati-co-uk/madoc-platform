import React, { useState } from 'react';
import styled from 'styled-components';

import { InputBorderless } from './Input';
import { LinkButton } from './Button';
import { SearchIcon } from './SearchIcon';

const SearchContainer = styled.div`
  border-radius: 5px;
  margin-right: 20px;
  display: flex;
  background: #fff;
  border: 1px solid #370b0b;
  padding: 0.5em;
  font-size: 0.9em;
  line-height: 1.3em;
  width: 100%;
  box-shadow: none;
  &:focus {
    border-color: #333;
    outline: none;
  }
`;

export const SearchBox: React.FC<{
  onSearch: (val: string) => void;
  placeholder?: string;
  large?: boolean;
}> = ({ onSearch, placeholder = 'Search', large = false }) => {
  const [searchValue, setSearchValue] = useState('');
  return (
    <form
      style={{ marginRight: '20px' }}
      onSubmit={ev => {
        ev.preventDefault();
        onSearch(searchValue);
      }}
    >
      <SearchContainer>
        <InputBorderless
          type="text"
          id={!large ? 'search' : `searchLarge`}
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          placeholder={placeholder}
        />
        <LinkButton>
          <SearchIcon />
        </LinkButton>
      </SearchContainer>
    </form>
  );
};

