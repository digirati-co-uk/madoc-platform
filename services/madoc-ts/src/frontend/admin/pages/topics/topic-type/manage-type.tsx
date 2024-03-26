import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet } from 'react-router-dom';
import { SuccessMessage } from '../../../../shared/callouts/SuccessMessage';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { useLocationQuery } from '../../../../shared/hooks/use-location-query';
import { useSite } from '../../../../shared/hooks/use-site';
import { WidePage } from '../../../../shared/layout/WidePage';
import { useRouteContext } from '../../../../site/hooks/use-route-context';
import { useTopicType } from '../../../../site/pages/loaders/topic-type-loader';
import { AdminHeader } from '../../../molecules/AdminHeader';

export function ManageType() {
  const { topicType } = useRouteContext();
  const { t } = useTranslation();
  const { data } = useTopicType();
  const site = useSite();
  const { deleted } = useLocationQuery();

  const label = <LocaleString>{data?.title || { none: ['...'] }}</LocaleString>;

  return (
    <>
      {deleted ? <SuccessMessage>Topic was deleted</SuccessMessage> : null}
      <AdminHeader
        title={label}
        breadcrumbs={[
          {
            label: t('Topics'),
            link: `/topics`,
          },
          {
            label: t('All Types'),
            link: `/topics/types`,
          },
          {
            label: label,
            link: `/topics/${topicType}`,
            active: true,
          },
        ]}
        subtitle={
          <>
            <span>{t('Manage topic type')}</span>
            {' | '}
            <a href={`/s/${site.slug}/topics/${data?.slug}`}>{t('View on site')}</a>
          </>
        }
        menu={[
          {
            label: t('Topic type'),
            link: `/topics/${data?.slug || topicType}`,
          },
          {
            label: t('Topics'),
            link: `/topics/${data?.slug || topicType}/all`,
          },
          {
            label: 'Edit',
            link: `/topics/${data?.slug || topicType}/_/edit`,
          },
          {
            label: 'Delete',
            link: `/topics/${data?.slug || topicType}/_/delete`,
          },
          {
            label: 'Create topic',
            link: `/topics/${data?.slug || topicType}/_/create-topic`,
          },
        ]}
      />
      <WidePage>
        <Outlet />
      </WidePage>
    </>
  );
}
