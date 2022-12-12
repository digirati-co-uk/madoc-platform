import React from 'react';
import styled, { css } from 'styled-components';
import { SearchResult } from '../../../types/search';
import { parseUrn } from '../../../utility/parse-urn';
import { useRouteContext } from '../../site/hooks/use-route-context';
import { CroppedImage } from '../atoms/Images';
import { ImageStripBox } from '../atoms/ImageStrip';
import { GridContainer } from '../layout/Grid';
import { SnippetThumbnail, SnippetThumbnailContainer } from '../atoms/SnippetLarge';
import { createLink } from '../utility/create-link';
import { HrefLink } from '../utility/href-link';
import { LocaleString } from './LocaleString';

export const ResultsContainer = styled.div<{ $isFetching?: boolean }>`
  flex: 1 1 0px;
  transition: opacity 0.2s;

  ${props =>
    props.$isFetching &&
    css`
      opacity: 0.4;
    `}
`;

export const ResultsHeader = styled.h2`
  font-size: 2.125rem;
  padding-bottom: 0.9375rem;
  margin: 0;
`;

export const SearchHint = styled.div`
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
  padding: 1.25rem;
  margin: 1rem 0;
  border-bottom: 1px solid #eee;
`;

const ResultText = styled.span`
  text-decoration: none;
  line-height: 1.3em;
`;

const TextContainer = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  max-height: 100px;
`;

export const ResultTitle = styled.div`
  text-decoration: none;
  color: #2962ff;
  font-size: 1.25rem;
  padding-bottom: 0.625rem;
`;

export const TotalResults = styled.div`
  margin: 1em 0;
  color: #666;
`;

function sanitizeLabel(str: string) {
  return str.replace(/^.*': '/, '');
}

function replaceBreaks(str: string) {
  return str.replace(/[\\n]+/, '');
}

export const SearchItem: React.FC<{
  result: SearchResult;
  size?: 'large' | 'small';
  search?: string;
  list?: boolean;
  border?: string;
  textColor?: string;
  background?: string;
  imageStyle?: string;
}> = ({ result, size, search, list, border, textColor, background, imageStyle }) => {
  const things = ((result && result.contexts) || []).map(value => {
    return parseUrn(value.id);
  });
  const routeContext = useRouteContext();
  const projectId = routeContext.projectId;
  const collectionId = routeContext.collectionId
    ? routeContext.collectionId
    : things.find(thing => thing?.type.toLowerCase() === 'collection')?.id;
  const manifestId = things.find(thing => thing?.type.toLowerCase() === 'manifest')?.id;
  const canvasId = things.find(thing => thing?.type.toLowerCase() === 'canvas')?.id;
  const searchText = result.hits && result.hits[0] && result.hits[0].bounding_boxes ? search : undefined;
  const snippet = result.hits && result.hits[0] && result.hits[0].snippet ? result.hits[0].snippet : undefined;
  const isManifest = result.resource_type === 'Manifest';

  return (
    <>
      <HrefLink
        href={createLink({
          projectId,
          manifestId,
          canvasId,
          collectionId,
          query: { searchText },
        })}
        style={{ textDecoration: 'none' }}
      >
        <GridContainer>
          <ImageStripBox data-view-list={list} $border={border} $color={textColor} $bgColor={background} $size={size}>
            {isManifest ? (
              <SnippetThumbnailContainer stackedThumbnail={isManifest} portrait fluid>
                <SnippetThumbnail
                  src={result.madoc_thumbnail}
                  style={{ maxHeight: 200, fitContent: 'scale-down' } as any}
                />
              </SnippetThumbnailContainer>
            ) : (
              <CroppedImage $size={size} $covered={imageStyle === 'covered'}>
                <img src={result.madoc_thumbnail} />
              </CroppedImage>
            )}
            <TextContainer style={{ alignSelf: 'flex-start', marginLeft: '1em' }}>
              <LocaleString as={ResultTitle}>{result.label}</LocaleString>
              {snippet ? (
                <div style={{ paddingBottom: '.8em', maxWidth: 600 }}>
                  <ResultText
                    key={snippet}
                    dangerouslySetInnerHTML={{
                      __html: replaceBreaks(sanitizeLabel(snippet)),
                    }}
                  />
                </div>
              ) : null}
            </TextContainer>
          </ImageStripBox>
        </GridContainer>
      </HrefLink>
    </>
  );
};

export const SearchResults: React.FC<{
  searchResults: Array<SearchResult>;
  value?: string;
  isFetching?: boolean;
}> = ({ isFetching, searchResults = [], value }) => {
  return (
    <ResultsContainer $isFetching={isFetching}>
      {searchResults.map((result: SearchResult, index: number) => {
        return result ? (
          <SearchItem result={result} key={`${index}__${result.resource_id}`} search={value} size="small" />
        ) : null;
      })}
    </ResultsContainer>
  );
};
