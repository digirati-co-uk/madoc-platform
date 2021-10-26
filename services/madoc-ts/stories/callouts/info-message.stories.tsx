import * as React from 'react';
import { InfoMessage } from '../../src/frontend/shared/callouts/InfoMessage';
import { WhiteTickIcon } from '../../src/frontend/shared/icons/TickIcon';

export default {
  title: 'Callouts/Info message',
  component: InfoMessage,
  argTypes: {
    children: {
      name: 'Info message',
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
    children: 'This is an info message',
  },
};

const Template = (props: any) => <InfoMessage {...props} />;

export const DefaultInfoMessage = Template.bind({});
DefaultInfoMessage.args = {
  $small: false,
};

export const SmallInfoMessage = Template.bind({});
SmallInfoMessage.args = {
  $small: true,
};

export const InfoWithIcon = Template.bind({});
InfoWithIcon.args = {
  children: [<WhiteTickIcon key={0} />, 'This is with an icon.'],
};

export const SmallInfoWithIcon = Template.bind({});
SmallInfoWithIcon.args = {
  $small: true,
  children: [<WhiteTickIcon key={0} />, 'This is with an icon.'],
};

export const InfoWithLink = Template.bind({});
InfoWithLink.args = {
  children: [
    'An info message with ',
    <a key={0} href="#">
      a link
    </a>,
    ' included.',
  ],
};

export const InfoAsBanner = Template.bind({});
InfoAsBanner.args = {
  $banner: true,
  children: 'An info message as a banner',
};
