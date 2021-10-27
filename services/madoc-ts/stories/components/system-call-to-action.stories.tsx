import * as React from 'react';
import { SystemBackground } from '../../src/frontend/shared/atoms/SystemUI';
import { SystemCallToAction } from '../../src/frontend/shared/components/SystemCallToAction';

export default { title: 'Components / System call to action', component: SystemCallToAction };

const Template = (props: any) => (
  <SystemBackground>
    <SystemCallToAction {...props} />
  </SystemBackground>
);

export const defaultSystemCallToAction = Template.bind({});
defaultSystemCallToAction.args = {
  title: 'Create a new project',
  description: 'Get started with a template, or create a custom project',
  href: '#',
};
