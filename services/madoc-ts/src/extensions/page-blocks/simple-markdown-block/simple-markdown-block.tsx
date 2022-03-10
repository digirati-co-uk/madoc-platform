import React, { useState } from 'react';
import Editor, { theme } from 'rich-markdown-editor';
import styled from 'styled-components';
import { captureModelShorthand } from '../../../frontend/shared/capture-models/helpers/capture-model-shorthand';
import { useApi } from '../../../frontend/shared/hooks/use-api';
import { Button } from '../../../frontend/shared/navigation/Button';
import { ModalFooter } from '../../../frontend/shared/layout/Modal';
import { PageBlockEditor, ReactPageBlockDefinition } from '../extension';
import { StaticMarkdownBlock } from './static-markdown-block';

const MarkdownEditorWrapper = styled.div`
  padding: 0.6em 0.6em 0.6em 2em;
`;

const MarkdownEditor: PageBlockEditor = props => {
  const [value, setValue] = useState<string>(props.block.static_data.markdown || '');
  const api = useApi();
  // const searchLink = async (term: string): Promise<SearchResult[]> => {
  //   return [
  //     {
  //       title: 'Test link',
  //       subtitle: 'Manifest',
  //       url: '/',
  //     },
  //   ];
  // };

  const uploadMedia = async (file: File) => {
    return api.media.createMedia(file).then(media => {
      return media.publicLink;
    });
  };

  return (
    <>
      <MarkdownEditorWrapper>
        <Editor
          // onSearchLink={term => searchLink(term)}
          defaultValue={value}
          uploadImage={uploadMedia}
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
