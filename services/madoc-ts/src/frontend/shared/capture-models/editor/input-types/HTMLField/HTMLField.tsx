import React, { useMemo } from 'react';
import _RichTextEditor, { EditorValue } from 'react-rte';
import * as ReactDOM from 'react-dom';
import styled from 'styled-components';
import { useDebouncedCallback } from 'use-debounce';
import { BaseField, FieldComponent } from '../../../types/field-types';

export interface HTMLFieldProps extends BaseField {
  type: 'html-field';
  allowedTags?: string[];
  format?: 'html' | 'markdown';
  value: string;
  enableHistory?: boolean;
  enableExternalImages?: boolean;
  enableLinks?: boolean;
  enableStylesDropdown?: boolean;
  disabled?: boolean;
}

const INLINE_STYLE_BUTTONS = [
  { label: 'Bold', style: 'BOLD' },
  { label: 'Italic', style: 'ITALIC' },
  { label: 'Strikethrough', style: 'STRIKETHROUGH' },
  { label: 'Monospace', style: 'CODE' },
  { label: 'Underline', style: 'UNDERLINE' },
];

const BLOCK_TYPE_DROPDOWN = [
  { label: 'Normal', style: 'unstyled' },
  { label: 'Heading Large', style: 'header-one' },
  { label: 'Heading Medium', style: 'header-two' },
  { label: 'Heading Small', style: 'header-three' },
  { label: 'Code Block', style: 'code-block' },
];
const BLOCK_TYPE_BUTTONS = [
  { label: 'UL', style: 'unordered-list-item' },
  { label: 'OL', style: 'ordered-list-item' },
  { label: 'Blockquote', style: 'blockquote' },
];

const defaultEditorToolbarConfig: any = {
  display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS'],
  INLINE_STYLE_BUTTONS,
  BLOCK_TYPE_DROPDOWN,
  BLOCK_TYPE_BUTTONS,
};

// This is a bundling bug. MAD-1190
const RichTextEditor: typeof _RichTextEditor = (_RichTextEditor as any).default
  ? (_RichTextEditor as any).default
  : (_RichTextEditor as any);

const patchLegacyRefsForReact19 = () => {
  const richTextEditor = RichTextEditor as any;

  if (parseInt(React.version.split('.')[0], 10) < 19 || richTextEditor.__madocReact19Patched) {
    return;
  }

  const patchLegacyEditorRef = (node: any, owner: any): any => {
    if (!React.isValidElement(node)) {
      return node;
    }

    const reactElement = node as React.ReactElement & { ref?: unknown; props?: { children?: React.ReactNode; ref?: unknown } };
    const children = reactElement.props?.children;
    const patchedChildren =
      children === undefined ? undefined : React.Children.map(children, child => patchLegacyEditorRef(child, owner));
    const hasLegacyRef = reactElement.props?.ref === 'editor' || reactElement.ref === 'editor';

    if (!hasLegacyRef && patchedChildren === children) {
      return node;
    }

    const nextProps: { ref?: (instance: any) => void; children?: any } = {};
    if (patchedChildren !== children) {
      nextProps.children = patchedChildren;
    }

    if (hasLegacyRef) {
      nextProps.ref = (instance: any) => {
        owner._editorRef = instance;
      };
    }

    return React.cloneElement(reactElement, nextProps);
  };

  const originalRender = richTextEditor.prototype.render;
  richTextEditor.prototype.render = function patchedRender(this: any, ...args: any[]) {
    return patchLegacyEditorRef(originalRender.apply(this, args), this);
  };

  richTextEditor.prototype._focus = function patchedFocus(this: any) {
    if (this._editorRef && typeof this._editorRef.focus === 'function') {
      this._editorRef.focus();
    }
  };

  richTextEditor.__madocReact19Patched = true;
};

const patchFindDomNodeForReact19 = () => {
  const reactDOM = ReactDOM as any;

  if (parseInt(React.version.split('.')[0], 10) < 19 || reactDOM.__madocFindDomNodePatched) {
    return;
  }

  if (typeof reactDOM.findDOMNode !== 'function') {
    reactDOM.findDOMNode = (instance: any) => {
      if (instance?._inputRef?.parentElement?.parentElement) {
        return instance._inputRef.parentElement.parentElement;
      }
      return null;
    };
  }

  reactDOM.__madocFindDomNodePatched = true;
};

patchLegacyRefsForReact19();
patchFindDomNodeForReact19();

const StyledRichTextEditor = styled(RichTextEditor)`
  border-color: rgba(5, 42, 68, 0.2);
  font-family: inherit !important;

  &:focus-within {
    border-color: #005cc5;
  }

  [class^='IconButton__root'] {
    border-color: rgba(5, 42, 68, 0.2);
    background: rgba(5, 42, 68, 0.05);
    &:hover {
      background: rgba(5, 42, 68, 0.2);
    }
    span {
      color: rgba(5, 42, 68, 0.9);
    }
  }
  [class*='IconButton__isActive'] {
    background: rgba(5, 42, 68, 0.2);
  }
`;

export const HTMLField: FieldComponent<HTMLFieldProps> = ({
  value,
  format = 'html',
  updateValue,
  enableExternalImages,
  enableHistory,
  enableLinks,
  enableStylesDropdown,
  disabled,
}) => {
  const [initialValue, setValue] = React.useState<EditorValue>(() =>
    RichTextEditor.createValueFromString(value, format)
  );

  const toolbarConfig = useMemo(() => {
    const display = ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS'];

    if (enableExternalImages) {
      display.push('IMAGE_BUTTON');
    }

    if (enableHistory) {
      display.push('HISTORY_BUTTONS');
    }

    if (enableLinks) {
      display.push('LINK_BUTTONS');
    }

    if (enableStylesDropdown) {
      display.push('BLOCK_TYPE_DROPDOWN');
    }

    return { ...defaultEditorToolbarConfig, display };
  }, [enableExternalImages, enableHistory, enableLinks, enableStylesDropdown]);

  const [updateExternalValue] = useDebouncedCallback((v: EditorValue) => {
    updateValue(v.toString(format));
  }, 200);

  return (
    <StyledRichTextEditor
      disabled={disabled}
      toolbarConfig={toolbarConfig}
      value={initialValue}
      editorStyle={{ fontFamily: 'inherit', fontSize: 'inherit' }}
      onChange={e => {
        setValue(e);
        updateExternalValue(e);
      }}
    />
  );
};

export default HTMLField;
