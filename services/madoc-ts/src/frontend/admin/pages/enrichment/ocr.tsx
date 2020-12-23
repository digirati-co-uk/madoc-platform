import React from 'react';
import { WidePage } from '../../../shared/atoms/WidePage';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { UniversalRoute } from '../../../types';
import { AdminHeader } from '../../molecules/AdminHeader';

export const OcrPage: React.FC<{ route: UniversalRoute }> = ({ route }) => {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'OCR', active: true, link: `/enrichment/ocr` },
        ]}
        title="OCR Processing"
      />
      <WidePage>{renderUniversalRoutes(route.routes)}</WidePage>
    </>
  );
};
