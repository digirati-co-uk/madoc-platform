import * as React from 'react';
import { TopicDetails } from '../../src/frontend/site/features/TopicListing';

export default {
  title: 'Topics/TopicDetails',
  component: TopicDetails,
};

const Template: any = (props: any) => <TopicDetails {...props} />;

export const DefaultTopicView = Template.bind({});
DefaultTopicView.args = {
  topicId: '0d38f500-d152-4fc8-9b91-cdb45931b0c3',
};
