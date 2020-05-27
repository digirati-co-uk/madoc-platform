import { MemoryRouter } from 'react-router-dom';
import { AdminHeader } from '../src/frontend/admin/molecules/AdminHeader';
import * as React from 'react';
import { WidePage } from '../src/frontend/shared/atoms/WidePage';

export default { title: 'Admin' };

export const adminHeader = () => (
  <MemoryRouter>
    <AdminHeader title="My awesome project" />
  </MemoryRouter>
);

export const adminHeaderWithBreadcrumbsAndMenu = () => (
  <MemoryRouter>
    <AdminHeader
      title="My awesome project"
      breadcrumbs={[
        { label: 'site dashboard', link: '#' },
        { label: 'projects', link: '#' },
        { label: 'My project', link: '#', active: true },
      ]}
      menu={[
        { label: 'Overview', link: '#' },
        { label: 'Basic details', link: '#' },
        { label: 'Capture model', link: '#', active: true },
        { label: 'Content', link: '#' },
        { label: 'Access control', link: '#' },
        { label: 'Export', link: '#' },
      ]}
    />
    <WidePage>
      <p>Test some content on this page.</p>
    </WidePage>
  </MemoryRouter>
);
