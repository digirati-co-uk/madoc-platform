import React from 'react';
import { useTranslation } from 'react-i18next';
import { WidePage } from '../../../../shared/layout/WidePage';
import { renderUniversalRoutes } from '../../../../shared/utility/server-utils';
import { AdminHeader } from '../../../molecules/AdminHeader';

export const Media: React.FC<any> = ({ route }) => {
  const { t } = useTranslation();

  return (
    <>
      <AdminHeader
        title={t('Media')}
        subtitle={t('Manage media')}
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Media', link: '/media' },
        ]}
      />
      <WidePage>{renderUniversalRoutes(route.routes)}</WidePage>
    </>
  );
};
