import { MemoryRouter } from 'react-router-dom';
import { AdminHeader } from '../src/frontend/admin/molecules/AdminHeader';
import * as React from 'react';
import { GlobalHeader } from '../src/frontend/shared/atoms/GlobalHeader';
import { WidePage } from '../src/frontend/shared/atoms/WidePage';
import { LightNavigation, LightNavigationItem } from '../src/frontend/shared/atoms/LightNavigation';

export default { title: 'Admin' };

export const adminHeader = () => (
  <MemoryRouter>
    <GlobalHeader
      title={'Default site'}
      username={'Some user'}
      links={[
        { label: 'Dashboard', link: '#' },
        { label: 'View site', link: '#' },
        { label: 'Account', link: '#' },
        { label: 'Logout', link: '#' },
      ]}
    />
    <AdminHeader title="My awesome project" />
  </MemoryRouter>
);

export const adminHeaderWithBreadcrumbsAndMenu = () => (
  <MemoryRouter>
    <GlobalHeader
      title={'Default site'}
      username={'Some user'}
      links={[
        { label: 'Dashboard', link: '#' },
        { label: 'View site', link: '#' },
        { label: 'Account', link: '#' },
        { label: 'Logout', link: '#' },
      ]}
    />
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

export const adminHeaderWithBreadcrumbsAndMenuAndSearch = () => (
  <MemoryRouter>
    <GlobalHeader
      title={'Default site'}
      username={'Some user'}
      links={[
        { label: 'Dashboard', link: '#' },
        { label: 'View site', link: '#' },
        { label: 'Account', link: '#' },
        { label: 'Logout', link: '#' },
      ]}
    />
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
      search={true}
      searchFunction={val => [{ something: val }]}
    />
    <WidePage>
      <p>Test some content on this page.</p>
    </WidePage>
  </MemoryRouter>
);

export const LightNavigationExample = () => (
  <LightNavigation>
    <LightNavigationItem>
      <a>Item A</a>
    </LightNavigationItem>
    <LightNavigationItem $active>
      <a>Item B</a>
    </LightNavigationItem>
    <LightNavigationItem>
      <a>Item C</a>
    </LightNavigationItem>
    <LightNavigationItem>
      <a>Item D</a>
    </LightNavigationItem>
  </LightNavigation>
);
