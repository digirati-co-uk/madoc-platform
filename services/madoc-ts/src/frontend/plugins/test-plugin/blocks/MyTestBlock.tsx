import React from 'react';
import { blockConfigFor } from '../../../shared/plugins/external/block-config-for';

export const MyTestBlock: React.FC<{ text: string }> = ({ text }) => {
  return <div>My test block {text}</div>;
};

blockConfigFor(MyTestBlock, {
  type: 'MyPlugin.MyTestBlock',
  label: 'My test block',
  requiredContext: [],
  editor: {
    text: { type: 'text-field' },
  },
  anyContext: [],
  defaultProps: {
    text: '',
  },
});
