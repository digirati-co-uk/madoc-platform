import React from 'react';
import styled from 'styled-components';
import { SearchResult } from '../../../types/search';
import { parseUrn } from '../../../utility/parse-urn';
import { CroppedImage } from '../atoms/Images';
import { ImageStripBox } from '../atoms/ImageStrip';
import { SearchBox } from '../atoms/SearchBox';
import { GridContainer } from '../atoms/Grid';
import { createLink } from '../utility/create-link';
import { HrefLink } from '../utility/href-link';
import { LocaleString } from './LocaleString';

const ResultsContainer = styled.div`
  flex: 1 1 0px;
`;

const ResultsHeader = styled.h2`
  font-size: 2.125rem;
  padding-bottom: 0.9375rem;
  margin: 0;
`;

const SearchHint = styled.div`
  font-size: 0.85rem;
  color: #000000;
  margin: 0.5em 0;
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

const ResultText = styled.span`
  text-decoration: none;
  line-height: 1.3em;
`;

const ResultTitle = styled.div`
  text-decoration: none;
  color: #2962ff;
  font-size: 1.25rem;
  padding-bottom: 0.625rem;
`;

const TotalResults = styled.div`
  margin: 1em 0;
  color: #666;
`;

function sanitizeLabel(str: string) {
  return str.replace(/^.*': '/, '');
}

const SearchItem: React.FC<{ result: SearchResult; size?: 'large' | 'small'; search: string }> = ({
  result,
  size,
  search,
}) => {
  const things = ((result && result.contexts) || []).map(value => {
    return parseUrn(value.id);
  });

  const collectionId = things.find(thing => thing?.type.toLowerCase() === 'collection')?.id;
  const manifestId = things.find(thing => thing?.type.toLowerCase() === 'manifest')?.id;
  const canvasId = things.find(thing => thing?.type.toLowerCase() === 'canvas')?.id;
  const searchText = result.hits[0] && result.hits[0].bounding_boxes ? search : undefined;

  return (
    <ResultContainer>
      <HrefLink
        href={createLink({
          manifestId,
          canvasId,
          collectionId,
          query: { searchText },
        })}
        style={{ textDecoration: 'none' }}
      >
        <GridContainer>
          <ImageStripBox $size={size}>
            <CroppedImage $size={size}>
              <img src={result.madoc_thumbnail} />
            </CroppedImage>
          </ImageStripBox>
          <div style={{ alignSelf: 'flex-start', marginLeft: '1em' }}>
            <LocaleString as={ResultTitle}>{result.label}</LocaleString>
            {result.hits.map((found, i) => {
              return found.snippet ? (
                <div key={i} style={{ paddingBottom: '.8em' }}>
                  <ResultText
                    key={found.snippet}
                    dangerouslySetInnerHTML={{
                      __html: sanitizeLabel(found.snippet),
                    }}
                  />
                </div>
              ) : null;
            })}
          </div>
        </GridContainer>
      </HrefLink>
    </ResultContainer>
  );
};

export const SearchResults: React.FC<{
  searchFunction: (val: string) => void;
  searchResults: Array<SearchResult>;
  sortByFunction: (val?: string) => void;
  totalResults: number;
  value?: string;
}> = ({ searchFunction, searchResults = [], sortByFunction, totalResults, value }) => (
  <ResultsContainer>
    <ResultsHeader>Search Results</ResultsHeader>
    <SearchBox large={true} onSearch={searchFunction} placeholder="Keywords" value={value} />
    <SearchHint>Keyword search</SearchHint>
    <GridContainer $justify="flex-end">
      {/* <DropdownContainer>
        <Dropdown options={options} placeholder="Sort By" onChange={val => sortByFunction(val)} />
      </DropdownContainer> */}
    </GridContainer>
    <TotalResults>{`${totalResults} Results`}</TotalResults>
    <div>
      {searchResults.map((result: SearchResult, index: number) => {
        return result ? (
          <SearchItem result={result} key={`${index}__${result.resource_id}`} search={value} size="small" />
        ) : null;
      })}
    </div>
  </ResultsContainer>
);
