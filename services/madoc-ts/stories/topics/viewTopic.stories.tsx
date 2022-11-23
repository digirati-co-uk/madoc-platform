import * as React from 'react';
import { TopicItemsList } from '../../src/frontend/site/features/TopicListing';

export default {
  title: 'Topics/TopicItemsList',
  component: TopicItemsList,
};

const Template: any = (props: any) => <TopicItemsList {...props} />;

export const DefaultTopicItems = Template.bind({});
DefaultTopicItems.args = {
  type: 'entity',
  subtype: '0d38f500-d152-4fc8-9b91-cdb45931b0c3',
};
