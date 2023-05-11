import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { useSite } from '../../../../shared/hooks/use-site';
import { WidePage } from '../../../../shared/layout/WidePage';
import { useRouteContext } from '../../../../site/hooks/use-route-context';
import { useTopic } from '../../../../site/pages/loaders/topic-loader';
import { useTopicType } from '../../../../site/pages/loaders/topic-type-loader';
import { AdminHeader } from '../../../molecules/AdminHeader';

export function ManageTopic() {
  const { topic, topicType } = useRouteContext();
  const { t } = useTranslation();
  const { data } = useTopic();
  const { data: topicTypeData } = useTopicType();
  const site = useSite();

  const label = <LocaleString>{data?.label || { none: ['...'] }}</LocaleString>;
  const topicTypeLabel = <LocaleString>{topicTypeData?.label || { none: ['...'] }}</LocaleString>;

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          {
            label: t('Topics'),
            link: `/topics`,
          },
          {
            label: topicTypeLabel,
            link: `/topics/${topicType}`,
          },
          {
            label: label,
            link: `/topics/${topicType}/${data?.slug || topic}`,
            active: true,
          },
        ]}
        title={label}
        subtitle={
          <>
            <span>{t('Manage topic')}</span>
            {' | '}
            <a href={`/s/${site.slug}/topics/${topicType}/${data?.slug || topic}`}>{t('View on site')}</a>
          </>
        }
        menu={[
          {
            label: t('Topic'),
            link: `/topics/${topicType}/${data?.slug || topic}`,
          },
          {
            label: t('Items tagged'),
            link: `/topics/${topicType}/${data?.slug || topic}/items`,
          },
          {
            label: t('Edit'),
            link: `/topics/${topicType}/${data?.slug || topic}/_/edit`,
          },
          {
            label: t('Delete'),
            link: `/topics/${topicType}/${data?.slug || topic}/delete`,
          },
        ]}
      />
      <WidePage>
        <Outlet />
      </WidePage>
    </>
  );
}
