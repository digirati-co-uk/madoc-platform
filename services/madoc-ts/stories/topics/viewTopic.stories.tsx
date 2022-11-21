import * as React from 'react';
import { ViewSingleTopic } from '../../src/frontend/site/features/TopicListing';

export default {
  title: 'Topics/ViewTopic',
  component: ViewSingleTopic,
  argTypes: {
    query: {
      options: ['primary', 'secondary'],
      control: { type: 'radio' },
    },
  },
};

const Template: any = (props: any) => <ViewSingleTopic {...props} />;

export const DefaultTopicView = Template.bind({});
DefaultTopicView.args = {
  query: 'test',
};
