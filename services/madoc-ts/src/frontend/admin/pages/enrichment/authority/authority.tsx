import React from 'react';
import { Outlet } from 'react-router-dom';
import { WidePage } from '../../../../shared/layout/WidePage';
import { AdminHeader } from '../../../molecules/AdminHeader';

export function Authority() {
  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Authority', active: true, link: `/enrichment/authority` },
        ]}
        title="Authority"
        menu={[
          { label: 'Entities', link: '/enrichment/authority/entities' },
          { label: 'Entity types', link: '/enrichment/authority/entity-types' },
          { label: 'Resource tags', link: '/enrichment/authority/resource-tags' },
        ]}
      />
      <WidePage>
        <Outlet />
      </WidePage>
    </>
  );
}
