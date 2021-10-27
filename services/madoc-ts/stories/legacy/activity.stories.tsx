import * as React from 'react';
import { SystemBackground } from '../../src/frontend/shared/atoms/SystemUI';
import { ActivityContainer, Activity } from '../../src/frontend/shared/components/Activity';

export default { title: 'Legacy/Activity streams' };

const mockItems = [
  {
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
  {
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
  {
    id: 'http://localhost:8888/s/default/madoc/api/activity/example-stream/activity/31',
    type: 'Add',
    object: {
      id: 'http://example.org/collections/2021-05-25T17:56:29+00:00',
      type: 'Manifest',
      canonical: 'http://example.org/collections/2021-05-25T17:56:29+00:00',
    },
    summary: 'Automatically created activity from secondary stream: test-project',
    endTime: '2021-05-25T17:56:29.943Z',
  },
  {
    id: 'http://localhost:8888/s/default/madoc/api/activity/example-stream/activity/34',
    type: 'Update',
    object: {
      id: 'http://example.org/collections/2021-05-25T17:56:29+00:00',
      type: 'Manifest',
      canonical: 'http://example.org/collections/2021-05-25T17:56:29+00:00',
    },
    summary: '(source: test-project): Creating manifest in seconary stream',
    endTime: '2021-05-25T17:56:30.038Z',
  },
  {
    id: 'http://localhost:8888/s/default/madoc/api/activity/example-stream/activity/35',
    type: 'Add',
    object: {
      id: 'http://example.org/collections/2021-05-26T12:11:15+00:00',
      type: 'Manifest',
      canonical: 'http://example.org/collections/2021-05-26T12:11:15+00:00',
    },
    summary: 'Automatically created before action: Update',
    endTime: '2021-05-26T12:11:15.950Z',
  },
  {
    id: 'http://localhost:8888/s/default/madoc/api/activity/example-stream/activity/36',
    type: 'Update',
    object: {
      id: 'http://example.org/collections/2021-05-26T12:11:15+00:00',
      type: 'Manifest',
      canonical: 'http://example.org/collections/2021-05-26T12:11:15+00:00',
    },
    summary: 'Creating this manifest with a custom message',
    endTime: '2021-05-26T12:11:16.017Z',
  },
  {
    id: 'http://localhost:8888/s/default/madoc/api/activity/example-stream/activity/37',
    type: 'Add',
    object: {
      id: 'http://example.org/collections/2021-05-26T12:12:07+00:00',
      type: 'Manifest',
      canonical: 'http://example.org/collections/2021-05-26T12:12:07+00:00',
    },
    summary: 'Automatically created before action: Update',
    endTime: '2021-05-26T12:12:07.955Z',
  },
  {
    id: 'http://localhost:8888/s/default/madoc/api/activity/example-stream/activity/38',
    type: 'Update',
    object: {
      id: 'http://example.org/collections/2021-05-26T12:12:07+00:00',
      type: 'Manifest',
      canonical: 'http://example.org/collections/2021-05-26T12:12:07+00:00',
    },
    summary: 'Creating this manifest with a custom message',
    endTime: '2021-05-26T12:12:08.018Z',
  },
  {
    id: 'http://localhost:8888/s/default/madoc/api/activity/example-stream/activity/39',
    type: 'Add',
    object: {
      id: 'http://example.org/collections/2021-05-26T12:12:26+00:00',
      type: 'Manifest',
      canonical: 'http://example.org/collections/2021-05-26T12:12:26+00:00',
    },
    summary: 'Automatically created activity from secondary stream: test-project',
    endTime: '2021-05-26T12:12:26.481Z',
  },
  {
    id: 'http://localhost:8888/s/default/madoc/api/activity/example-stream/activity/42',
    type: 'Update',
    object: {
      id: 'http://example.org/collections/2021-05-26T12:12:26+00:00',
      type: 'Manifest',
      canonical: 'http://example.org/collections/2021-05-26T12:12:26+00:00',
    },
    summary: '(source: test-project): Creating manifest in seconary stream',
    endTime: '2021-05-26T12:12:26.568Z',
  },
];

export const DefaultView = () => {
  return (
    <SystemBackground>
      <ActivityContainer>
        {mockItems.map((item, i) => {
          return (
            <Activity
              key={i}
              activity={item}
              actions={[
                { label: 'Import to madoc', link: '#', external: true },
                { label: 'See details', link: '#', external: true },
                { label: 'View in UV', link: '#', external: true },
                { label: 'View in Mirador', link: '#', external: true },
              ]}
            />
          );
        })}
      </ActivityContainer>
    </SystemBackground>
  );
};
