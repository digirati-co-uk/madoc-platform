import * as React from 'react';
import { Activity, ActivityContainer } from '../../src/frontend/shared/components/Activity';

export default {
  title: 'Components / Activity',
  component: Activity,
  argTypes: {
    activity: {
      options: ['Add', 'Update', 'Delete', 'Move'],
      mapping: {
        Add: {
          id: 'http://localhost:8888/s/default/madoc/api/activity/example-stream/activity/29',
          type: 'Add',
          object: {
            id: 'http://example.org/collections/2021-05-25T17:46:35+00:00',
            type: 'Manifest',
            canonical: 'http://example.org/collections/2021-05-25T17:46:35+00:00',
          },
          summary: 'Automatically created before action: Update',
          endTime: '2021-05-25T17:46:35.479Z',
        },
        Update: {
          id: 'http://localhost:8888/s/default/madoc/api/activity/example-stream/activity/30',
          type: 'Update',
          object: {
            id: 'http://example.org/collections/2021-05-25T17:46:35+00:00',
            type: 'Manifest',
            canonical: 'http://example.org/collections/2021-05-25T17:46:35+00:00',
          },
          summary: 'Creating this manifest with a custom message',
          endTime: '2021-05-25T17:46:35.541Z',
        },
        Delete: {
          id: 'http://localhost:8888/s/default/madoc/api/activity/example-stream/activity/31',
          type: 'Delete',
          object: {
            id: 'http://example.org/collections/2021-05-25T17:46:35+00:00',
            type: 'Manifest',
            canonical: 'http://example.org/collections/2021-05-25T17:46:35+00:00',
          },
          summary: 'Manifest was deleted',
          endTime: '2021-05-25T17:46:35.541Z',
        },
        Move: {
          id: 'http://localhost:8888/s/default/madoc/api/activity/example-stream/activity/31',
          type: 'Move',
          object: {
            id: 'http://example.org/collections/2021-05-25T17:46:35+00:00',
            type: 'Manifest',
            canonical: 'http://example.org/collections/2021-05-25T17:46:35+00:00',
          },
          summary: 'Manifest was moved',
          endTime: '2021-05-25T17:46:35.541Z',
        },
      },
    },
  },
  args: {
    activity: 'Add',
    actions: [{ label: 'See details', link: '#', external: true }],
  },
};

const Template: any = (props: any) => (
  <ActivityContainer>
    <Activity {...props} />
  </ActivityContainer>
);

export const DefaultActivity = Template.bind({});
DefaultActivity.args = {};
