import * as React from 'react';
import { WarningMessage } from '../../src/frontend/shared/callouts/WarningMessage';
import { WhiteTickIcon } from '../../src/frontend/shared/icons/TickIcon';

export default {
  title: 'Callouts/Warning message',
  component: WarningMessage,
  argTypes: {
    children: {
      name: 'Warning message',
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
    children: 'This is a warning message',
  },
};

const Template = (props: any) => <WarningMessage {...props} />;

export const DefaultWarningMessage = Template.bind({});
DefaultWarningMessage.args = {
  $small: false,
};

export const SmallWarningMessage = Template.bind({});
SmallWarningMessage.args = {
  $small: true,
};

export const WarningWithIcon = Template.bind({});
WarningWithIcon.args = {
  children: [<WhiteTickIcon key={0} />, 'This is with an icon.'],
};

export const SmallWarningWithIcon = Template.bind({});
SmallWarningWithIcon.args = {
  $small: true,
  children: [<WhiteTickIcon key={0} />, 'This is with an icon.'],
};

export const WarningWithLink = Template.bind({});
WarningWithLink.args = {
  children: [
    'A warning message with ',
    <a key={0} href="#">
      a link
    </a>,
    ' included.',
  ],
};

export const WarningAsBanner = Template.bind({});
WarningAsBanner.args = {
  $banner: true,
  children: 'A warning message as a banner',
};
