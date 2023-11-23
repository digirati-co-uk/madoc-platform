import React, { useEffect, useRef } from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';

export function JsSnippetBlock(props: { js: string }) {
  const script = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (script.current && props.js) {
      const $script = document.createElement('script');
      $script.innerHTML = props.js;
      script.current.appendChild($script);
    }
  }, []);

  if (!props.js) {
    return null;
  }

  return <div ref={script} />;
}

blockEditorFor(JsSnippetBlock, {
  label: 'JS Snippet',
  type: 'default.JsSnippetBlock',
  defaultProps: { js: '' },
  editor: {
    js: { type: 'text-field', label: 'JS Code to embed', multiline: true, minLines: 6 },
  },
});
