import * as React from 'react';
import { HotSpot } from '../../src/frontend/shared/atoms/HotSpot';

export default {
  title: 'Capture models/Hot spots',
  component: HotSpot,

  argTypes: {
    status: {
      options: ['Small', 'Medium', 'Large'],
      mapping: {
        Small: 'sm',
        Medium: 'md',
        Large: 'ld',
      },
    },
  },
};

const Template = (props: any) => (
  <div style={{ position: 'relative', margin: 50 }}>
    <HotSpot {...props} />
  </div>
);

export const DefaultHotSpot = Template.bind({});
DefaultHotSpot.args = {};
