import { InternationalString } from '@iiif/presentation-3';
import React, { useRef } from 'react';
import { RoundedCard } from '../../../frontend/shared/capture-models/editor/components/RoundedCard/RoundedCard';
import { LocaleString, useCreateLocaleString } from '../../../frontend/shared/components/LocaleString';
import { CroppedImage } from '../../../frontend/shared/atoms/Images';
import { useTranslation } from 'react-i18next';
import { ImageStripBox } from '../../../frontend/shared/atoms/ImageStrip';
import { ImageGrid } from '../../../frontend/shared/atoms/ImageGrid';
import { Heading5 } from '../../../frontend/shared/typography/Heading5';
import { CanvasSnippet } from '../../../frontend/shared/components/CanvasSnippet';
import { useParams } from 'react-router-dom';
import { extractIdFromUrn } from '../../../utility/parse-urn';
import { useInfiniteQuery } from 'react-query';
import { useApi } from '../../../frontend/shared/hooks/use-api';
import { useInfiniteAction } from '../../../frontend/site/hooks/use-infinite-action';
import { Button } from '../../../frontend/shared/navigation/Button';

export type TopicItemExplorerProps = {
  id: string;
  label: string;
  type: string;
  value: {
    madoc_id: string;
    label: InternationalString;
    thumbnail?: string;
    count: number;
  } | null;
};

export const TopicItemExplorer: React.FC<TopicItemExplorerProps & {
  updateValue: (value: TopicItemExplorerProps['value']) => void;
}> = props => {
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

  if (props.value) {
    return (
      <div>
        <RoundedCard interactive size="small" onClick={() => props.updateValue(null)}>
          <CanvasSnippet id={extractIdFromUrn(props.value.madoc_id)} />
        </RoundedCard>
      </div>
    );
  }

  return (
    <div ref={container} style={{ maxHeight: 500, overflowY: 'scroll' }}>
      <ImageGrid $size="small">
        {pages?.map((page, key) => {
          console.log(pages);
          return (
            <React.Fragment key={key}>
              {page.results.map(item => (
                <ImageStripBox
                  onClick={() =>
                    props.updateValue({
                      count: 0,
                      madoc_id: item.resource_id,
                      label: item.label,
                      thumbnail: item.madoc_thumbnail,
                    })
                  }
                  key={item.resource_id}
                >
                  <CroppedImage>
                    {item.madoc_thumbnail ? (
                      <img alt={createLocaleString(item.label, t('Canvas thumbnail'))} src={item.madoc_thumbnail} />
                    ) : null}
                    <LocaleString as={Heading5}>{item.label}</LocaleString>
                  </CroppedImage>
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
