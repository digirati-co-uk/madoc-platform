import React from 'react';

import { Pagination } from '../../../../shared/components/Pagination';
import { useTopicItems } from '../../../../shared/hooks/use-topic-items';
import { EmptyState } from '../../../../shared/layout/EmptyState';
import { useTopic } from '../../../../site/pages/loaders/topic-loader';
import { TableRow, TableRowLabel } from '../../../../shared/layout/Table';
import { LocaleString } from '../../../../shared/plugins/public-api';
import { HrefLink } from '../../../../shared/utility/href-link';
import { CroppedImage } from '../../../../shared/atoms/Images';
import { useTranslation } from 'react-i18next';
import { parseUrn } from '../../../../../utility/parse-urn';
export function ListTopicResources() {
  const { data: topic } = useTopic();
  const [{ data, isLoading, latestData }, { query, page }] = useTopicItems(topic?.id);
  const { t } = useTranslation();

  const link = (id: string) => {
    const parsed = parseUrn(id);
    return parsed?.type === 'manifest' ? `/manifests/${parsed?.id}` : `/canvases/${parsed?.id}`;
  };

  if (data?.pagination.totalResults === 0) {
    return <EmptyState>{t('Nothing tagged yet')}</EmptyState>;
  }
  return (
    <div>
      <p>
        {t('Items')} : {data?.pagination.totalResults}
      </p>
      {data?.results.map((item: any) => (
        <TableRow key={item.resource_id}>
          <CroppedImage data-size={'tiny'}>
            {item.madoc_thumbnail ? (
              <img alt={`${t('thumbnail for ')} ${item.type}`} src={item.madoc_thumbnail} />
            ) : null}
          </CroppedImage>
          <TableRowLabel>
            <HrefLink href={link(item.resource_id)}>
              <LocaleString>{item.label}</LocaleString> - {item.resource_type}
            </HrefLink>
          </TableRowLabel>
        </TableRow>
      ))}
      <Pagination
        page={page}
        totalPages={latestData && latestData.pagination ? latestData.pagination.totalPages : undefined}
        stale={isLoading}
        extraQuery={query}
      />
    </div>
  );
}
