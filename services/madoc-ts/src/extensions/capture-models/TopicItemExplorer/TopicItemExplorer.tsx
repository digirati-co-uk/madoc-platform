import { InternationalString } from '@iiif/presentation-3';
import React, { useRef } from 'react';
import { RoundedCard } from '../../../frontend/shared/capture-models/editor/components/RoundedCard/RoundedCard';
import { LocaleString, useCreateLocaleString } from '../../../frontend/shared/components/LocaleString';
import { CroppedImage } from '../../../frontend/shared/atoms/Images';
import { useTranslation } from 'react-i18next';
import { ImageStripBox } from '../../../frontend/shared/atoms/ImageStrip';
import { ImageGrid } from '../../../frontend/shared/atoms/ImageGrid';
import { Heading5 } from '../../../frontend/shared/typography/Heading5';
import { useParams } from 'react-router-dom';
import { useInfiniteQuery } from 'react-query';
import { useApi } from '../../../frontend/shared/hooks/use-api';
import { useInfiniteAction } from '../../../frontend/site/hooks/use-infinite-action';
import { Button } from '../../../frontend/shared/navigation/Button';
import { FeaturedResource } from '../../enrichment/authority/types';
import { FieldComponent } from '../../../frontend/shared/capture-models/types/field-types';
import { ManifestSnippet } from '../../../frontend/shared/components/ManifestSnippet';
import { extractIdFromUrn } from '../../../utility/parse-urn';

export type TopicItemExplorerProps = {
  id: string;
  label: string;
  type: string;
  value: string | number | null;
};

export const TopicItemExplorer: FieldComponent<TopicItemExplorerProps> = ({ value, updateValue }) => {
  const api = useApi();
  const { t } = useTranslation();
  const container = useRef<HTMLDivElement>(null);
  const createLocaleString = useCreateLocaleString();
  const { topic } = useParams<Record<'topic', any>>();

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

  const manifestID = parseManifestId(value);

  if (manifestID) {
    return (
      <div>
        <RoundedCard interactive size="small" onClick={() => updateValue(null)}>
          <ManifestSnippet id={manifestID} />
          {/*<CroppedImage data-size="small">*/}
          {/*  {value.thumbnail ? (*/}
          {/*    <img alt={createLocaleString(value.label, t('Item thumbnail'))} src={value.thumbnail} />*/}
          {/*  ) : null}*/}
          {/*</CroppedImage>*/}
          {/*<LocaleString as={Heading5}>{value.label}</LocaleString>*/}
        </RoundedCard>
      </div>
    );
  }

  return (
    <div ref={container} style={{ maxHeight: 500, overflowY: 'scroll', border: '1px solid grey', padding: '0.5em' }}>
      <ImageGrid $size="small">
        {pages?.map((page, key) => {
          return (
            <React.Fragment key={key}>
              {page.results.map(item => (
                <RoundedCard
                  interactive
                  size="small"
                  onClick={() => updateValue(item.resource_id)}
                  key={item.resource_id}
                >
                  <ManifestSnippet id={item.resource_isd} />
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

function parseManifestId(id: null | string | number): number | null {
  if (!id) {
    return null;
  }
  if (typeof id === 'string') {
    if (id.toUpperCase().includes('URN')) {
      const parsedId = extractIdFromUrn(id);
      return parsedId !== undefined ? parsedId : null;
    }
    return Number(id);
  }
  return id;
}
