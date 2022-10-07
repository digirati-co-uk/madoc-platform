import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import React from 'react';

export function HelloWorld(props: { name: string }) {
  return <div>Hello {props.name || 'world'}!</div>;
}

blockEditorFor(HelloWorld, {
  type: 'hello-world',
  label: 'Hello world',
  defaultProps: {
    name: 'World', // This will pre-populate the form
  },
  editor: {
    name: { label: 'Enter a name', type: 'text-field' },
  },
});
