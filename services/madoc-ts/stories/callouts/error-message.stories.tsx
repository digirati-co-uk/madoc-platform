import * as React from 'react';
import { ErrorMessage } from '../../src/frontend/shared/callouts/ErrorMessage';
import { WhiteTickIcon } from '../../src/frontend/shared/icons/TickIcon';

export default {
  title: 'Callouts/Error message',
  component: ErrorMessage,
  argTypes: {
    children: {
      name: 'Error message',
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
  },
  args: {
    children: 'This is an error message',
  },
};

const Template = (props: any) => <ErrorMessage {...props} />;

export const DefaultErrorMessage = Template.bind({});
DefaultErrorMessage.args = {
  $small: false,
};

export const SmallErrorMessage = Template.bind({});
SmallErrorMessage.args = {
  $small: true,
};

export const ErrorWithIcon = Template.bind({});
ErrorWithIcon.args = {
  children: [<WhiteTickIcon key={0} />, 'This is with an icon.'],
};

export const SmallErrorWithIcon = Template.bind({});
SmallErrorWithIcon.args = {
  $small: true,
  children: [<WhiteTickIcon key={0} />, 'This is with an icon.'],
};

export const ErrorWithLink = Template.bind({});
ErrorWithLink.args = {
  children: [
    'An error message with ',
    <a key={0} href="#">
      a link
    </a>,
    ' included.',
  ],
};

export const ErrorAsBanner = Template.bind({});
ErrorAsBanner.args = {
  $banner: true,
  children: 'An error message as a banner',
};
