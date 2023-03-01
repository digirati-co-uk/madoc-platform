import React from 'react';
import { Slot } from '../../shared/page-blocks/slot';
import { Heading1 } from '../../shared/typography/Heading1';
import { StaticPage } from '../features/StaticPage';
import { useTranslation } from 'react-i18next';
import { AllTopicTypeItems } from '../features/AllTopicTypeItems';
import { DisplayBreadcrumbs } from '../../shared/components/Breadcrumbs';
import { TopicTypeListPagination } from '../features/TopicTypeListPagination';

export function ViewTopicTypes() {
  const { t } = useTranslation();

  return (
    <StaticPage title="All Topic types">
      <Slot name="common-breadcrumbs">
        <DisplayBreadcrumbs />
      </Slot>

      <Slot name="all-topic-types-header">
        <Heading1>{t('All Topic Types')}</Heading1>
      </Slot>

      <Slot name="all-topic-types-pagination">
        <TopicTypeListPagination />
      </Slot>

      <Slot name="all-topic-types-body">
        <AllTopicTypeItems />
      </Slot>

      <Slot name="all-topic-types-footer"></Slot>

      {/*<pre>{JSON.stringify(data, null, 2)}</pre>*/}
    </StaticPage>
  );
}
