import * as React from 'react';
import { SmallToast } from '../../src/frontend/shared/callouts/SmallToast';

export default {
  title: 'Callouts / Small toast',
  component: SmallToast,
  args: {
    children: 'This is a small toast',
    $active: true,
  },

  argTypes: {
    children: {
      name: 'Message',
      type: { name: 'string', required: false },
      table: {
        type: { summary: 'string' },
      },
      control: {
        type: 'text',
      },
    },
    $active: { name: 'Is Active', defaultValue: false },

    ref: { table: { disable: true } },
    theme: { table: { disable: true } },
    as: { table: { disable: true } },
    forwardedAs: { table: { disable: true } },
  },
};

const Template = (props: any) => <SmallToast {...props} />;

export const DefaultSmallToast = Template.bind({});
DefaultSmallToast.args = {};
