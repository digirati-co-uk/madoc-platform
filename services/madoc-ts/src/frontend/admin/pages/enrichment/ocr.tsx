import React from 'react';
import { Outlet } from 'react-router-dom';
import { WidePage } from '../../../shared/layout/WidePage';
import { AdminHeader } from '../../molecules/AdminHeader';

export const OcrPage: React.FC = () => {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'OCR', active: true, link: `/enrichment/ocr` },
        ]}
        title="OCR Processing"
      />
      <WidePage>
        <Outlet />
      </WidePage>
    </>
  );
};
