import React from 'react';
import { useTranslation } from 'react-i18next';
import { WidePage } from '../../../../shared/layout/WidePage';
import { useApi } from '../../../../shared/hooks/use-api';
import { renderUniversalRoutes } from '../../../../shared/utility/server-utils';
import { AdminHeader } from '../../../molecules/AdminHeader';

export const PageBlocks: React.FC<any> = ({ route }) => {
  const { t } = useTranslation();

  // api.pageBlocks.get

  return (
    <>
      <AdminHeader
        title={t('Page blocks')}
        subtitle={t('Manage pages, slots and blocks')}
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Page blocks', link: '/page-blocks' },
        ]}
      />
      <WidePage>{renderUniversalRoutes(route.routes)}</WidePage>
    </>
  );
};
