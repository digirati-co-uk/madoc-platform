import React, { useMemo, useState } from 'react';
import EditorModule, { theme } from 'rich-markdown-editor';
import { captureModelShorthand } from '../../../frontend/shared/capture-models/helpers/capture-model-shorthand';
import { useApi } from '../../../frontend/shared/hooks/use-api';
import { Button } from '../../../frontend/shared/navigation/Button';
import { ModalFooter } from '../../../frontend/shared/layout/Modal';
import { blockEditorFor } from '../block-editor-for';
import { PageBlockEditor, ReactPageBlockDefinition } from '../extension';
import { StaticMarkdownBlock } from './static-markdown-block';

const Editor = (
  typeof EditorModule === 'function'
    ? EditorModule
    : (EditorModule as unknown as { default: typeof EditorModule }).default
) as typeof EditorModule;

const MarkdownEditor: PageBlockEditor = props => {
  const initialValue = useMemo(() => props.block.static_data?.markdown || '', [props.block.static_data?.markdown]);
  const [value, setValue] = useState<string>(initialValue);
  const [openInNewTab, setOpenInNewTab] = useState(!!props.block.static_data?.openInNewTab);
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
      <div className="py-[0.6em] pr-[0.6em] pl-[2em]">
        <Editor
          // onSearchLink={term => searchLink(term)}
          defaultValue={initialValue}
          uploadImage={uploadMedia}
          onChange={newValue => {
            const md = typeof newValue === 'function' ? newValue() : '';
            setValue(md);
            props.onChange({
              ...props.block,
              static_data: {
                ...(props.block.static_data || {}),
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
      </div>
      <label className="flex items-center gap-2 px-8 py-2">
        <input type="checkbox" checked={openInNewTab} onChange={event => setOpenInNewTab(event.target.checked)} />
        Open links in new tab
      </label>
      <ModalFooter>
        <Button
          disabled={
            value === (props.block.static_data?.markdown || '') &&
            openInNewTab === !!props.block.static_data?.openInNewTab
          }
          $primary
          onClick={() =>
            props.onSave({
              ...props.block,
              static_data: {
                ...(props.block.static_data || {}),
                markdown: value,
                openInNewTab,
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

const definition: ReactPageBlockDefinition<{ markdown: string; openInNewTab?: boolean }> = {
  label: 'Simple Markdown block',
  type: 'simple-markdown-block',
  renderType: 'react',
  model: captureModelShorthand({}),
  defaultData: {
    markdown: '',
    openInNewTab: false,
  },
  render: data => {
    // @todo.
    return <StaticMarkdownBlock markdown={data.markdown || ''} openInNewTab={data.openInNewTab} />;
  },
  customEditor: MarkdownEditor,
};

export default definition;
