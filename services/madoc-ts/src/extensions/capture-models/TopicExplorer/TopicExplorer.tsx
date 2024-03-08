import React, { useRef } from 'react';
import { ImageGrid } from '../../../frontend/shared/atoms/ImageGrid';
import { FieldComponent } from '../../../frontend/shared/capture-models/types/field-types';
import { Subheading3 } from '../../../frontend/shared/typography/Heading3';
import { RoundedCard } from '../../../frontend/shared/capture-models/editor/components/RoundedCard/RoundedCard';
import { useParams } from 'react-router-dom';
import { useInfiniteQuery } from 'react-query';
import { useInfiniteAction } from '../../../frontend/site/hooks/use-infinite-action';
import { useApi } from '../../../frontend/shared/hooks/use-api';
import { Button } from '../../../frontend/shared/navigation/Button';
import { LocaleString } from '../../../frontend/shared/components/LocaleString';
import { useApiTopic } from '../../../frontend/shared/hooks/use-api-topic';
import { TopicSnippetCard } from '../../../frontend/shared/components/TopicSnippet';
import { Subheading1 } from '../../../frontend/shared/typography/Heading1';

export type TopicExplorerProps = {
  id: string;
  label: string;
  type: string;
  value: {
    slug?: string;
    id?: string;
    type: string;
  } | null;
};

export const TopicExplorer: FieldComponent<TopicExplorerProps> = ({ value, updateValue }) => {
  const container = useRef<HTMLDivElement>(null);
  const { topicType } = useParams<Record<'topicType', any>>();
  const api = useApi();

  const { data: pages, fetchMore, canFetchMore, isFetchingMore } = useInfiniteQuery(
    ['topic-autocomplete', {}],
    async (key, _, page?: number) => {
      return api.enrichment.entityAutoComplete(topicType, '', page);
    },
    {
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
      <RoundedCard interactive size="small" onClick={() => updateValue(null)}>
        <GetTopic value={value} />
      </RoundedCard>
    );
  }

  return (
    <div ref={container} style={{ maxHeight: 500, overflowY: 'scroll', border: '1px solid grey', padding: '0.5em' }}>
      {pages && pages[0].pagination.totalResults === 0 ? (
        <Subheading3>No topics in this type</Subheading3>
      ) : (
        <ImageGrid>
          {pages?.map((page, key) => {
            return (
              <React.Fragment key={key}>
                {page.results.map(item => {
                  return (
                    <RoundedCard
                      key={item.id}
                      size="small"
                      interactive
                      onClick={() => {
                        updateValue({ slug: item.slug, id: item.id, type: item.type_slug });
                      }}
                    >
                      <LocaleString as={Subheading1}>{item.title}</LocaleString>
                      <LocaleString as={Subheading3}>{item.label}</LocaleString>
                    </RoundedCard>
                  );
                })}
              </React.Fragment>
            );
          })}
          <Button ref={loadMoreButton} onClick={() => fetchMore()} style={{ display: canFetchMore ? 'block' : 'none' }}>
            Load more
          </Button>
        </ImageGrid>
      )}
    </div>
  );
};

export const GetTopic: React.FC<{
  value:
    | {
        slug?: string;
        type?: string;
        id?: string;
      }
    | string;
}> = ({ value }) => {
  const { topicType } = useParams<Record<'topicType', any>>();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const slug = !value.slug && typeof value === 'string' ? value : value.slug;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const type = !value.type && typeof value === 'string' ? topicType : value.type;
  const { data } = useApiTopic(type, slug);

  if (data) {
    return <TopicSnippetCard topic={data} cardBorder="black" size={'small'} />;
  }
  return null;
};
