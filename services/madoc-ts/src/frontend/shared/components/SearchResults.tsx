import React from 'react';
import styled from 'styled-components';

import { SearchResult } from '../../../types/schemas/search';

import { SearchBox } from '../atoms/SearchBox';
import { GridContainer } from '../atoms/Grid';
import { GridColumn, Dropdown } from '@capture-models/editor';
import { Link } from 'react-router-dom';

const ResultsContainer = styled.div`
  min-width: 70vw;
`;

const ResultsHeader = styled.h2`
  font-size: 2.125rem;
  padding-bottom: 0.9375rem;
  margin: 0;
`;

const SearchHint = styled.span`
  font-size: 0.75rem;
  padding-left: 1rem;
  color: #000000 50%;
  text-decoration: rgba(0, 0, 0, 0.5);
  padding-bottom: 0.875rem;
`;

const ResultContainer = styled.li`
  width: 100%;
  list-style-type: none;
  display: flex;
  border-radius: 5px;
  padding: 1.25rem;
  margin: 1rem 0;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
`;

const ResultText = styled.div`
  text-decoration: none;
`;

const DropdownContainer = styled.div`
  width: 40%;
  margin-right: 20px;
`;

const SearchItem: React.FC<{ result: SearchResult }> = ({ result }) => {
  return (
    <ResultContainer>
      <Link to={result.link} style={{ textDecoration: 'none' }}>
        <GridContainer>
          <img src={result.thumbnail}></img>
          <GridColumn>
            <ResultText>{result.title}</ResultText>
            <ResultText>{result.description}</ResultText>
          </GridColumn>
        </GridContainer>
      </Link>
    </ResultContainer>
  );
};

const options = [
  { value: 'Option1', text: 'Option 1' },
  { value: 'Option2', text: 'Option 2' },
  { value: 'Option3', text: 'Option 3' },
];

export const SearchResults: React.FC<{
  searchFunction: (val: string) => void;
  searchResults: Array<SearchResult>;
  sortByFunction: (val?: string) => void;
}> = ({ searchFunction, searchResults = [], sortByFunction }) => (
  <ResultsContainer>
    <ResultsHeader>Search Results</ResultsHeader>
    <SearchBox large={true} onSearch={searchFunction} placeholder="Keywords" />
    <SearchHint>Keyword search for title or person</SearchHint>
    <GridContainer $justify="flex-end">
      <DropdownContainer>
        <Dropdown options={options} placeholder="Sort By" onChange={val => sortByFunction(val)} />
      </DropdownContainer>
    </GridContainer>
    {`${searchResults.length} Results`}
    <GridColumn>
      {searchResults.map((result: SearchResult, index: number) => {
        return <SearchItem result={result} key={index} />;
      })}
    </GridColumn>
  </ResultsContainer>
);
