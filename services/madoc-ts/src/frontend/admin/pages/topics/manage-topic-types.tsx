import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { WidePage } from '../../../shared/layout/WidePage';
import { usePaginatedTopicTypes } from '../../../site/pages/loaders/topic-type-list-loader';
import { AdminHeader } from '../../molecules/AdminHeader';

export function ManageTopicTypes() {
  const { t } = useTranslation();
  usePaginatedTopicTypes();

  return (
    <>
      <AdminHeader
        title={t('Topic types')}
        breadcrumbs={[
          {
            label: t('Topics'),
            link: `/topics`,
          },
        ]}
        subtitle={t('Manage topic types displayed')}
        action={{ label: 'Add new topic type', link: `/topics/_/create-type` }}
        menu={[
          {
            label: 'All topic types',
            link: '/topics',
          },
          {
            label: 'Create topic type',
            link: '/topics/_/create-type',
          },
          {
            label: 'Create topic',
            link: '/topics/_/create-topic',
          },
        ]}
      />
      <WidePage>
        <Outlet />
      </WidePage>
    </>
  );
}
