import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import styled from 'styled-components';
import { AdminHeader } from '../../src/frontend/admin/molecules/AdminHeader';
import * as React from 'react';
import { Button, ButtonRow } from '../../src/frontend/shared/navigation/Button';
import { EmptySlotActions, EmptySlotContainer, EmptySlotLabel } from '../../src/frontend/shared/layout/EmptySlot';
import { GlobalHeader } from '../../src/frontend/shared/navigation/GlobalHeader';
import {
  PageEditorActions,
  PageEditorButton,
  PageEditorContainer,
  PageEditorDescription,
  PageEditorTitle,
} from '../../src/frontend/shared/page-blocks/PageEditor';
import {
  SlotEditorButton,
  SlotEditorContainer,
  SlotEditorLabel,
  SlotEditorLabelReadOnly,
  SlotEditorReadOnly,
  SlotEditorWhy,
  SlotOutlineContainer,
} from '../../src/frontend/shared/layout/SlotEditor';
import { WidePage } from '../../src/frontend/shared/layout/WidePage';
import { LightNavigation, LightNavigationItem } from '../../src/frontend/shared/navigation/LightNavigation';
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
} from '../../src/frontend/shared/components/AdminMenu';
import { ModalButton } from '../../src/frontend/shared/components/Modal';
import { SiteProvider } from '../../src/frontend/shared/hooks/use-site';

export default { title: 'Legacy/Admin' };

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

export const AdminPageBuilding = () => {
  return (
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
      <WidePage>
        <PageEditorContainer>
          <PageEditorTitle>My great page</PageEditorTitle>
          <PageEditorDescription>It has a description that is not very long yet.</PageEditorDescription>
          <PageEditorDescription>
            Parent page: <a href="#">My first page</a>
          </PageEditorDescription>
          <PageEditorActions>
            <PageEditorButton>Add subpage</PageEditorButton>
            <PageEditorButton>Edit page</PageEditorButton>
            <PageEditorButton>Change layout</PageEditorButton>
            <PageEditorButton>Navigation options</PageEditorButton>
            <ModalButton
              as={PageEditorButton}
              title="Are you sure you want to delete this page?"
              render={() => <div>Cannot be removed</div>}
              footerAlignRight
              renderFooter={({ close }) => {
                return (
                  <ButtonRow $noMargin>
                    <PageEditorButton onClick={close}>Cancel</PageEditorButton>
                    <Button onClick={close}>Remove</Button>
                  </ButtonRow>
                );
              }}
            >
              Delete page
            </ModalButton>
          </PageEditorActions>
        </PageEditorContainer>

        <EmptySlotContainer>
          <EmptySlotLabel>Empty slot</EmptySlotLabel>
          <EmptySlotActions>
            <PageEditorButton>Add content</PageEditorButton>
            <PageEditorButton>Reuse existing slot</PageEditorButton>
          </EmptySlotActions>
        </EmptySlotContainer>

        <SlotEditorReadOnly>
          <SlotEditorLabelReadOnly>Footer</SlotEditorLabelReadOnly>
          <SlotEditorButton>Customise</SlotEditorButton>
        </SlotEditorReadOnly>
        <SlotOutlineContainer>
          <div>Some content here...</div>
        </SlotOutlineContainer>

        <SlotEditorContainer>
          <SlotEditorLabel>Header</SlotEditorLabel>
          <SlotEditorButton>Edit blocks</SlotEditorButton>
          <SlotEditorButton>Add block</SlotEditorButton>
          <SlotEditorButton>Change layout</SlotEditorButton>
          <ModalButton as={SlotEditorButton} title="Advanced options" render={() => <div>Advanced</div>}>
            Advanced options
          </ModalButton>
          <SlotEditorButton>Reset slot</SlotEditorButton>
          <SlotEditorWhy>Why am I seeing this slot?</SlotEditorWhy>
        </SlotEditorContainer>
        <SlotOutlineContainer>
          <div>Some content here...</div>
        </SlotOutlineContainer>
      </WidePage>
    </MemoryRouter>
  );
};

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
