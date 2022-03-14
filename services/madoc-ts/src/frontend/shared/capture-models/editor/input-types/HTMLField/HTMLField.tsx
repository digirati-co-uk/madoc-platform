import React, { useMemo } from 'react';
import RichTextEditor, { EditorValue } from 'react-rte';
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

const StyledRichTextEditor = styled(RichTextEditor)`
  border-color: rgba(5, 42, 68, 0.2);
  font-family: inherit !important;
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
