import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AdminHeader } from '../../src/frontend/admin/molecules/AdminHeader';
import { GlobalHeader } from '../../src/frontend/shared/navigation/GlobalHeader';

export default {
  title: 'Admin / Admin header',
  component: AdminHeader,
  argTypes: {
    title: {
      name: 'Page title',
      required: true,
      control: { type: 'text' },
      table: { summary: 'string' },
    },

    sticky: {
      name: 'Sticky position',
      defaultValue: false,
      control: { type: 'boolean' },
    },

    subtitle: {
      name: 'Subtitle / summary',
      control: { type: 'text' },
    },

    breadcrumbs: {
      name: 'Breadcrumbs',
    },
    menu: {
      name: 'Breadcrumbs',
    },
    search: {
      name: 'Show search',
      defaultValue: false,
      control: { type: 'boolean' },
    },
    noMargin: {
      name: 'Hide margin',
      defaultValue: false,
      control: { type: 'boolean' },
    },
    thumbnail: {
      name: 'Thumbnail',
      control: { type: 'text' },
    },
    searchFunction: {
      name: 'Handle search query',
      action: 'search',
    },
    action: {
      name: 'Action',
    },
  },
  args: {
    title: 'My project header',
  },
};

const Template = (props: any) => (
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
    <AdminHeader {...props} />
  </MemoryRouter>
);

export const SimpleAdminHeader = Template.bind({});

export const AdminHeaderWithCallToAction = Template.bind({});
AdminHeaderWithCallToAction.args = {
  action: {
    label: 'My action',
    external: false,
    link: '#',
  },
};
