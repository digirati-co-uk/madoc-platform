import * as React from 'react';
import { SuccessMessage } from '../../src/frontend/shared/callouts/SuccessMessage';
import { WhiteTickIcon } from '../../src/frontend/shared/icons/TickIcon';

export default {
  title: 'Callouts/Success message',
  component: SuccessMessage,
  argTypes: {
    children: {
      name: 'Success message',
      type: { name: 'string', required: false },
      table: {
        type: { summary: 'string' },
      },
      control: {
        type: 'text',
      },
    },
    $small: { name: 'Small', defaultValue: false },
    $wide: { name: 'Wide', defaultValue: false },
    $margin: { name: 'Bottom margin', defaultValue: false },
    $banner: { name: 'As banner', defaultValue: false },

    ref: { table: { disable: true } },
    theme: { table: { disable: true } },
    as: { table: { disable: true } },
    forwardedAs: { table: { disable: true } },
    'data-cy': { table: { disable: true } },
  },
  args: {
    children: 'This is an success message',
  },
};

const Template = (props: any) => <SuccessMessage {...props} />;

export const DefaultSuccessMessage = Template.bind({});
DefaultSuccessMessage.args = {
  $small: false,
};

export const SmallSuccessMessage = Template.bind({});
SmallSuccessMessage.args = {
  $small: true,
};

export const SuccessWithIcon = Template.bind({});
SuccessWithIcon.args = {
  children: [<WhiteTickIcon key={0} />, 'This is with an icon.'],
};

export const SmallSuccessWithIcon = Template.bind({});
SmallSuccessWithIcon.args = {
  $small: true,
  children: [<WhiteTickIcon key={0} />, 'This is with an icon.'],
};

export const SuccessWithLink = Template.bind({});
SuccessWithLink.args = {
  children: [
    'A success message with ',
    <a key={0} href="#">
      a link
    </a>,
    ' included.',
  ],
};

export const SuccessAsBanner = Template.bind({});
SuccessAsBanner.args = {
  $banner: true,
  children: 'A success message as a banner',
};
