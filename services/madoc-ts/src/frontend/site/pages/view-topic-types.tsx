import React from 'react';
import { Pagination } from '../../shared/components/Pagination';
import { Slot } from '../../shared/page-blocks/slot';
import { Heading1 } from '../../shared/typography/Heading1';
import { usePaginatedTopicTypes } from './loaders/topic-type-list-loader';
import { StaticPage } from '../features/StaticPage';
import { useTranslation } from 'react-i18next';
import { AllTopicTypeItems } from '../features/AllTopicTypeItems';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';

export function ViewTopicTypes() {
  const { t } = useTranslation();
  const { data } = usePaginatedTopicTypes();

  return (
    <StaticPage title="All Topic types">
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <Slot name="all-topic-types-header">
        <Heading1>{t('All Topic Types')}</Heading1>

        <Pagination
          pageParam={'page'}
          page={data?.pagination ? data.pagination.page : 1}
          totalPages={data?.pagination ? data.pagination.totalPages : 1}
          stale={!data?.pagination}
        />
      </Slot>

      <Slot name="all-topic-types-body">
        <AllTopicTypeItems />
      </Slot>

      <Slot name="all-topic-types-footer"></Slot>

      {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
    </StaticPage>
  );
}
