import * as React from 'react';
import { Stepper, StepperContainer } from '../../src/frontend/shared/components/Stepper';

export default {
  title: 'Components / Stepper',
  Component: Stepper,
  argTypes: {
    status: {
      options: ['todo', 'progress', 'done'],
      mapping: {
        todo: 'todo',
        progress: 'progress',
        done: 'done',
      },
    },
  },
};

const Template = (props: any) => (
  <StepperContainer>
    <Stepper {...props} status={'done'} />
    <Stepper {...props} status={'progress'} />
    <Stepper {...props} status={'todo'} />
  </StepperContainer>
);

export const DefaultStepper = Template.bind({});

DefaultStepper.args = {
  title: 'Basic details',
  description: 'Click to edit',
  status: 'done',
  open: true,
  children: 'This is the content of the stepper',
};
