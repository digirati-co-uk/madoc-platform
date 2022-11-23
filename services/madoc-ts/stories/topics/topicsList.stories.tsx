import * as React from 'react';
import { AllTopicListing } from '../../src/frontend/site/features/TopicListing';

export default {
  title: 'Topics/TopicList',
  component: AllTopicListing,
};

const Template: any = (props: any) => <AllTopicListing {...props} />;

export const DefaultTopicList = Template.bind({});
DefaultTopicList.args = {
  url: 'https://enrichment.ida.madoc.io/madoc/entity',
};
