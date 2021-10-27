import * as React from 'react';
import { LoadingBlock } from '../../src/frontend/shared/callouts/LoadingBlock';

export default {
  title: 'Callouts / Loading block',
  component: LoadingBlock,
};

const Template = (props: any) => <LoadingBlock {...props} />;

export const DefaultLoadingBlock = Template.bind({});
DefaultLoadingBlock.args = {};
