import * as React from 'react';
import { SystemBackground } from '../../src/frontend/shared/atoms/SystemUI';
import { SystemOrderBy } from '../../src/frontend/shared/components/SystemOrderBy';

export default {
  title: 'components / System order by',
  component: SystemOrderBy,
};

const Template = (props: any) => (
  <SystemBackground>
    <SystemOrderBy {...props} />
  </SystemBackground>
);

export const DefaultSystemOrderBy = Template.bind({});
DefaultSystemOrderBy.args = {
  items: ['thing-1', 'thing-2', 'thing-3', 'thing-4'],
};
export const DefaultSystemOrderByWithSearch = Template.bind({});
DefaultSystemOrderByWithSearch.args = {
  items: ['thing-1', 'thing-2', 'thing-3', 'thing-4'],
  onSearch: () => {
    // no-op
  },
};
