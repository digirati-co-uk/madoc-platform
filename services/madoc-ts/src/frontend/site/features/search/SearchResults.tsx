import React from 'react';
import styled, { css } from 'styled-components';
import { SearchResult } from '../../../../types/search';
import { parseUrn } from '../../../../utility/parse-urn';
import { useRouteContext } from '../../hooks/use-route-context';
import { CroppedImage } from '../../../shared/atoms/Images';
import { ImageStripBox } from '../../../shared/atoms/ImageStrip';
import { GridContainer } from '../../../shared/layout/Grid';
import { SnippetThumbnail, SnippetThumbnailContainer } from '../../../shared/atoms/SnippetLarge';
import { createLink } from '../../../shared/utility/create-link';
import { HrefLink } from '../../../shared/utility/href-link';
import { LocaleString } from '../../../shared/components/LocaleString';

const ResultsContainer = styled.div<{ $isFetching?: boolean }>`
  flex: 1 1 0;
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
  return str.replace(/\\n/, '');
}

const SearchItem: React.FC<{ result: SearchResult; size?: 'large' | 'small'; search?: string }> = ({
  result,
  size,
  search,
}) => {
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
    <ResultContainer>
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
          <ImageStripBox $size={size} style={{ width: 200, maxHeight: 200, marginBottom: 20 }}>
            {isManifest ? (
              <SnippetThumbnailContainer data-is-stacked={isManifest} data-is-portrait={true} data-is-fluid={true}>
                <SnippetThumbnail
                  src={result.madoc_thumbnail}
                  style={{ maxHeight: 200, fitContent: 'scale-down' } as any}
                />
              </SnippetThumbnailContainer>
            ) : (
              <CroppedImage $size={size}>
                <img src={result.madoc_thumbnail} />
              </CroppedImage>
            )}
          </ImageStripBox>
          <div style={{ alignSelf: 'flex-start', marginLeft: '1em' }}>
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
          </div>
        </GridContainer>
      </HrefLink>
    </ResultContainer>
  );
};

export const SearchResults: React.FC<{
  searchResults: Array<SearchResult>;
  value?: string;
  isFetching?: boolean;
}> = ({ isFetching, searchResults = [], value }) => (
  <ResultsContainer $isFetching={isFetching}>
    {searchResults.map((result: SearchResult, index: number) => {
      return result ? (
        <SearchItem result={result} key={`${index}__${result.resource_id}`} search={value} size="small" />
      ) : null;
    })}
  </ResultsContainer>
);
