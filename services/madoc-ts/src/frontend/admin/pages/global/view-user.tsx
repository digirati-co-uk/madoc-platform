import React from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';
import { GetUser } from '../../../../extensions/site-manager/types';
import { WidePage } from '../../../shared/layout/WidePage';
import { useData } from '../../../shared/hooks/use-data';
import { serverRendererFor } from '../../../shared/plugins/external/server-renderer-for';
import { AdminHeader } from '../../molecules/AdminHeader';

export const ViewUser: React.FC = () => {
  const { t } = useTranslation();
  const { data } = useData<GetUser>(ViewUser);
  const { userId } = useParams<{ userId: string }>();

  return (
    <>
      <AdminHeader
        title={data?.user.name || '...'}
        subtitle={data?.user.email}
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Users', link: '/global/users' },
          { label: data?.user.name || '...', link: `/global/users/${userId}`, active: true },
        ]}
        menu={[
          { label: t('Overview'), link: `/global/users/${userId}` },
          { label: t('Edit details'), link: `/global/users/${userId}/edit` },
          { label: t('User sites'), link: `/global/users/${userId}/sites` },
          { label: t('Reset password'), link: `/global/users/${userId}/password` },
          { label: t('Delete user'), link: `/global/users/${userId}/delete` },
        ]}
      />
      <WidePage>
        <Outlet />
      </WidePage>
    </>
  );
};

serverRendererFor(ViewUser, {
  getKey: params => ['global-get-user', { userId: Number(params.userId) }],
  getData: (key, vars, api) => {
    return api.siteManager.getUserById(vars.userId);
  },
});
