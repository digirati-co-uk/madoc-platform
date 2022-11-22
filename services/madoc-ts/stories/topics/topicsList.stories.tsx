import * as React from 'react';
import { TopicListing } from '../../src/frontend/site/features/TopicListing';

export default {
  title: 'Topics/TopicList',
  component: TopicListing,
};

const Template: any = (props: any) => <TopicListing {...props} />;

export const DefaultTopicList = Template.bind({});
DefaultTopicList.args = {
  url: 'https://enrichment.ida.madoc.io/madoc/entity',
};
