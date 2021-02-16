import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AdminHeader } from '../src/frontend/admin/molecules/AdminHeader';
import * as React from 'react';
import { GlobalHeader } from '../src/frontend/shared/atoms/GlobalHeader';
import { WidePage } from '../src/frontend/shared/atoms/WidePage';
import { LightNavigation, LightNavigationItem } from '../src/frontend/shared/atoms/LightNavigation';
import {
  AdminLayoutContainer,
  AdminLayoutMain,
  AdminLayoutMenu,
  AdminMenuContainer,
  AdminMenuItem,
  AdminMenuItemContainer,
  AdminMenuItemIcon,
  AdminMenuItemLabel,
  AdminMenuSubItem,
  AdminMenuSubItemContainer,
  AdminSearchIcon,
  AdminSidebarContainer,
  DashboardIcon,
  ManageCollectionsIcon,
  ManageManifestsIcon,
  ProjectsIcon,
  SiteConfigurationIcon,
  SiteSwitcherBackButton,
  SiteSwitcherContainer,
  SiteSwitcherSiteName,
} from '../src/frontend/shared/components/AdminMenu';
import { SiteProvider } from '../src/frontend/shared/hooks/use-site';

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

export const AdminHeaderWithBreadcrumbsAndMenu = () => (
  <MemoryRouter>
    <SiteProvider value={{ site: { slug: '#', id: 1 } }}>
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
    </SiteProvider>
  </MemoryRouter>
);

export const AdminHeaderWithBreadcrumbsAndMenuAndSearch = () => (
  <MemoryRouter>
    <SiteProvider value={{ site: { slug: '#', id: 1 } }}>
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
    </SiteProvider>
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

export const Admin_Menu = () => {
  const [selected, setSelected] = useState(1);
  const [menu, changeMenu] = useState(false);

  return (
    <MemoryRouter>
      <SiteProvider value={{ site: { slug: '#', id: 1 } as any }}>
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

        <AdminLayoutContainer>
          <AdminLayoutMenu $collapsed={menu}>
            <AdminSidebarContainer>
              <SiteSwitcherContainer>
                <SiteSwitcherSiteName>My madoc site</SiteSwitcherSiteName>
                <SiteSwitcherBackButton>Back to site</SiteSwitcherBackButton>
              </SiteSwitcherContainer>

              <AdminMenuContainer>
                <AdminMenuItemContainer>
                  <AdminMenuItem $active={selected === 0} onClick={() => setSelected(0)}>
                    <AdminMenuItemIcon>
                      <DashboardIcon />
                    </AdminMenuItemIcon>
                    <AdminMenuItemLabel>Admin dashboard</AdminMenuItemLabel>
                  </AdminMenuItem>
                </AdminMenuItemContainer>

                <AdminMenuItemContainer>
                  <AdminMenuItem $active={selected === 1} onClick={() => setSelected(1)}>
                    <AdminMenuItemIcon>
                      <ManageCollectionsIcon />
                    </AdminMenuItemIcon>
                    <AdminMenuItemLabel>Manage collections</AdminMenuItemLabel>
                  </AdminMenuItem>

                  <AdminMenuSubItemContainer $open={selected === 1}>
                    <AdminMenuSubItem>Add new collection</AdminMenuSubItem>
                  </AdminMenuSubItemContainer>
                </AdminMenuItemContainer>

                <AdminMenuItemContainer>
                  <AdminMenuItem $active={selected === 2} onClick={() => setSelected(2)}>
                    <AdminMenuItemIcon>
                      <ManageManifestsIcon />
                    </AdminMenuItemIcon>
                    <AdminMenuItemLabel>Manage manifests</AdminMenuItemLabel>
                  </AdminMenuItem>

                  <AdminMenuSubItemContainer $open={selected === 2}>
                    <AdminMenuSubItem>Add new manifest</AdminMenuSubItem>
                    <AdminMenuSubItem>View manifests with OCR</AdminMenuSubItem>
                  </AdminMenuSubItemContainer>
                </AdminMenuItemContainer>

                <AdminMenuItemContainer>
                  <AdminMenuItem $active={selected === 4} onClick={() => setSelected(4)}>
                    <AdminMenuItemIcon>
                      <ProjectsIcon />
                    </AdminMenuItemIcon>
                    <AdminMenuItemLabel>Projects</AdminMenuItemLabel>
                  </AdminMenuItem>
                </AdminMenuItemContainer>

                <AdminMenuItemContainer>
                  <AdminMenuItem $active={selected === 5} onClick={() => setSelected(5)}>
                    <AdminMenuItemIcon>
                      <AdminSearchIcon />
                    </AdminMenuItemIcon>
                    <AdminMenuItemLabel>Search indexing</AdminMenuItemLabel>
                  </AdminMenuItem>
                </AdminMenuItemContainer>

                <AdminMenuItemContainer>
                  <AdminMenuItem href="#" $active={selected === 6} onClick={() => setSelected(6)}>
                    <AdminMenuItemIcon>
                      <SiteConfigurationIcon />
                    </AdminMenuItemIcon>
                    <AdminMenuItemLabel>Site configuration</AdminMenuItemLabel>
                  </AdminMenuItem>
                </AdminMenuItemContainer>

                <AdminMenuItemContainer>
                  <AdminMenuItem onClick={() => changeMenu(e => !e)}>
                    <AdminMenuItemIcon>
                      <SiteConfigurationIcon />
                    </AdminMenuItemIcon>
                    <AdminMenuItemLabel>Toggle menu</AdminMenuItemLabel>
                  </AdminMenuItem>
                </AdminMenuItemContainer>
              </AdminMenuContainer>
            </AdminSidebarContainer>
          </AdminLayoutMenu>
          <AdminLayoutMain>
            <AdminHeaderWithBreadcrumbsAndMenu />
          </AdminLayoutMain>
        </AdminLayoutContainer>
      </SiteProvider>
    </MemoryRouter>
  );
};
