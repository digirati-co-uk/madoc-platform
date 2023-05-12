import React from 'react';
import { useTranslation } from 'react-i18next';
import { RoundedCard } from '../../../shared/capture-models/editor/components/RoundedCard/RoundedCard';
import { WidePage } from '../../../shared/layout/WidePage';
import { HrefLink } from '../../../shared/utility/href-link';
import { AdminHeader } from '../../molecules/AdminHeader';
import { Outlet } from 'react-router-dom';

export const TopicIndexWrapper: React.FC = () => {
  const { t } = useTranslation();
  return (
    <>
      <AdminHeader
        title={t('Manage Topics')}
        breadcrumbs={[
          {
            label: t('Topics'),
            link: `/topics`,
          },
        ]}
        subtitle={t('Manage and view topic types, topics and resource-tags')}
      />
      <WidePage>
        <Outlet />
      </WidePage>
    </>
  );
};

export const TopicsIndex: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div style={{ maxWidth: 600 }}>
      <HrefLink href={`/topics/types`} style={{ textDecoration: 'none' }}>
        <RoundedCard label="View all topic types" interactive />
      </HrefLink>
      <HrefLink href={`/topics/all`} style={{ textDecoration: 'none' }}>
        <RoundedCard label="View all topics" interactive />
      </HrefLink>
      <HrefLink href={`/topics/_/create-type`} style={{ textDecoration: 'none' }}>
        <RoundedCard label="Create a topic type" interactive />
      </HrefLink>
      <HrefLink href={`/topics/_/create-topic`} style={{ textDecoration: 'none' }}>
        <RoundedCard label="Create a topic" interactive />
      </HrefLink>
    </div>
  );
};
