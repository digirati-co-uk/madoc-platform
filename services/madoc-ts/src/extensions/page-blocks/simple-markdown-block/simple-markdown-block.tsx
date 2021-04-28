import React, { useState } from 'react';
import Editor, { theme } from 'rich-markdown-editor';
import { captureModelShorthand } from '@capture-models/helpers';
import styled from 'styled-components';
import { Button } from '../../../frontend/shared/atoms/Button';
import { ModalFooter } from '../../../frontend/shared/atoms/Modal';
import { PageBlockEditor, ReactPageBlockDefinition } from '../extension';
import { StaticMarkdownBlock } from './static-markdown-block';

const MarkdownEditorWrapper = styled.div`
  padding: 0.6em 0.6em 0.6em 2em;
`;

const MarkdownEditor: PageBlockEditor = props => {
  const [value, setValue] = useState<string>(props.block.static_data.markdown || '');
  return (
    <>
      <MarkdownEditorWrapper>
        <Editor
          defaultValue={value}
          onChange={newValue => {
            const md = newValue();
            setValue(md);
            props.onChange({
              ...props.block,
              static_data: {
                markdown: md,
              },
            });
          }}
          theme={
            {
              ...theme,
              background: 'transparent',
              text: 'inherit',
            } as any
          }
        />
      </MarkdownEditorWrapper>
      <ModalFooter>
        <Button
          disabled={value === props.block.static_data.markdown}
          $primary
          onClick={() =>
            props.onSave({
              ...props.block,
              static_data: {
                markdown: value,
              },
            })
          }
        >
          Save
        </Button>
      </ModalFooter>
    </>
  );
};

const definition: ReactPageBlockDefinition<{ markdown: string }> = {
  label: 'Simple Markdown block',
  type: 'simple-markdown-block',
  renderType: 'react',
  model: captureModelShorthand({}),
  defaultData: {
    markdown: '',
  },
  render: data => {
    // @todo.
    return <StaticMarkdownBlock markdown={data.markdown || ''} />;
  },
  customEditor: MarkdownEditor,
};

export default definition;
