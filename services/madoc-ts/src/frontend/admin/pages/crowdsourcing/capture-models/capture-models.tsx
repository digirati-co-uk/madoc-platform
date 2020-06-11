import React from 'react';
import { renderUniversalRoutes } from '../../../../shared/utility/server-utils';
import { useTranslation } from 'react-i18next';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../../shared/atoms/WidePage';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

export const CaptureModels = createUniversalComponent(({ route }) => {
  const { t } = useTranslation();

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: t('Site admin'), link: '/' },
          { label: t('Capture models'), link: '/capture-models', active: true },
        ]}
        title="Capture models"
      />
      <WidePage>{renderUniversalRoutes(route.routes)}</WidePage>
    </>
  );
}, {});
