import { InternationalString } from '@iiif/presentation-3';
import React, { useRef } from 'react';
import { RoundedCard } from '../../../frontend/shared/capture-models/editor/components/RoundedCard/RoundedCard';
import { LocaleString, useCreateLocaleString } from '../../../frontend/shared/components/LocaleString';
import { CroppedImage } from '../../../frontend/shared/atoms/Images';
import { useTranslation } from 'react-i18next';
import { ImageStripBox } from '../../../frontend/shared/atoms/ImageStrip';
import { ImageGrid } from '../../../frontend/shared/atoms/ImageGrid';
import { Heading5, SingleLineHeading5 } from '../../../frontend/shared/typography/Heading5';
import { useParams } from 'react-router-dom';
import { useInfiniteQuery } from 'react-query';
import { useApi } from '../../../frontend/shared/hooks/use-api';
import { useInfiniteAction } from '../../../frontend/site/hooks/use-infinite-action';
import { Button } from '../../../frontend/shared/navigation/Button';
import { FeaturedResource } from '../../enrichment/authority/types';
import { FieldComponent } from '../../../frontend/shared/capture-models/types/field-types';
import { ManifestSnippet } from '../../../frontend/shared/components/ManifestSnippet';
import { extractIdFromUrn, parseUrn } from '../../../utility/parse-urn';
import {Subheading3} from "../../../frontend/shared/typography/Heading3";

export type TopicItemExplorerProps = {
  id: string;
  label: string;
  type: string;
  value: string | null;
};

export const TopicItemExplorer: FieldComponent<TopicItemExplorerProps> = ({ value, updateValue }) => {
  const api = useApi();
  const { t } = useTranslation();
  const container = useRef<HTMLDivElement>(null);
  const createLocaleString = useCreateLocaleString();
  const { topic } = useParams<Record<'topic', any>>();

  console.log(value);
  const { data: pages, fetchMore, canFetchMore, isFetchingMore } = useInfiniteQuery(
    ['topic-items', {}],
    async (key, _, page?: number) => {
      return api.getSearchQuery({ facets: [{ type: 'entity', indexable_text: topic }] } as any, page);
    },
    {
      enabled: !!topic,
      getFetchMore: lastPage => {
        if (lastPage.pagination.totalPages === lastPage.pagination.page) {
          return undefined;
        }
        return {
          page: lastPage.pagination.page + 1,
        };
      },
    }
  );
  const [loadMoreButton] = useInfiniteAction({
    fetchMore,
    canFetchMore,
    isFetchingMore,
    container: container,
  });

  if (value) {
    // const valueId = value.madoc_id !== null ? value.madoc_id : value.resource_id;
    const manifestID = parseManifestId(value);

    if (manifestID) {
      return (
        <RoundedCard interactive size="small" onClick={() => updateValue(null)}>
          <ManifestSnippet id={manifestID} hideButton />
        </RoundedCard>
      );
    }
  }
  return (
    <div ref={container} style={{ maxHeight: 500, overflowY: 'scroll', border: '1px solid grey', padding: '0.5em' }}>
      <ImageGrid>
        {pages && pages[0].pagination.totalResults === 0 && <Subheading3>No items tagged in this type</Subheading3>}
        {pages?.map((page, key) => {
          return (
            <React.Fragment key={key}>
              {page.results.map(item => (
                <RoundedCard
                  key={item.resource_id}
                  interactive
                  size="small"
                  onClick={() => updateValue(item.resource_id)}
                >
                  <ManifestSnippet id={parseManifestId(item.resource_id)} hideButton />
                </RoundedCard>
              ))}
            </React.Fragment>
          );
        })}
        <Button ref={loadMoreButton} onClick={() => fetchMore()} style={{ display: canFetchMore ? 'block' : 'none' }}>
          Load more
        </Button>
      </ImageGrid>
    </div>
  );
};

function parseManifestId(id: null | string | number): number | string {
  if (!id) {
    return '';
  }
  if (typeof id === 'string') {
    if (id.toUpperCase().includes('URN')) {
      const parsedId = extractIdFromUrn(id);
      return parsedId !== undefined ? parsedId : '';
    }
    return Number(id);
  }
  return id;
}
