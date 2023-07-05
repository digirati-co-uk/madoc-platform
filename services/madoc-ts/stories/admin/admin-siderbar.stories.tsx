import * as React from 'react';
import { AdminSidebar } from '../../src/frontend/admin/molecules/AdminSidebar';
import { AdminLayoutContainer, AdminLayoutMenu } from '../../src/frontend/shared/components/AdminMenu';
import { SiteProvider } from '../../src/frontend/shared/hooks/use-site';

export default {
  title: 'Admin / Admin sidebar',
  Component: AdminSidebar,
  args: {
    globalAdmin: false,
  },
  argTypes: {
    globalAdmin: { name: 'Global admin' },
  },
};

const Template: any = (props: any) => (
  <SiteProvider
    value={{
      site: { id: 1, slug: 'default', title: 'My site' },
      user: { id: 1, site_role: 'admin', role: props.globalAdmin ? 'global_admin' : 'site_admin' },
    }}
  >
    <AdminLayoutContainer>
      <AdminLayoutMenu>
        <AdminSidebar {...props} />
      </AdminLayoutMenu>
    </AdminLayoutContainer>
  </SiteProvider>
);

export const DefaultAdminSidebar = Template.bind({});
