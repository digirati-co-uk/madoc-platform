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
import { FeatureResource } from '../../enrichment/authority/types';
import { FieldComponent } from '../../../frontend/shared/capture-models/types/field-types';

export type TopicItemExplorerProps = {
  id: string;
  label: string;
  type: string;
  value: FeatureResource | null;
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

  if (value) {
    return (
      <div>
        <RoundedCard interactive size="small" onClick={() => updateValue(null)}>
          <CroppedImage data-size="small">
            {value.thumbnail ? (
              <img alt={createLocaleString(value.label, t('Item thumbnail'))} src={value.thumbnail} />
            ) : null}
          </CroppedImage>
          <LocaleString as={Heading5}>{value.label}</LocaleString>
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
                <ImageStripBox
                  $border={'#000000'}
                  $bgColor={'#eee'}
                  onClick={() =>
                    updateValue({
                      madoc_id: item.resource_id,
                      label: item.label,
                      thumbnail: item.madoc_thumbnail,
                      type: item.resource_type,
                      url: item.url,
                      created: '',
                      modified: '',
                      metadata: '',
                      count: 0,
                    })
                  }
                  key={item.resource_id}
                >
                  <CroppedImage>
                    {item.madoc_thumbnail ? (
                      <img alt={createLocaleString(item.label, t('Item thumbnail'))} src={item.madoc_thumbnail} />
                    ) : null}
                  </CroppedImage>
                  <LocaleString as={Heading5}>{item.label}</LocaleString>
                </ImageStripBox>
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
