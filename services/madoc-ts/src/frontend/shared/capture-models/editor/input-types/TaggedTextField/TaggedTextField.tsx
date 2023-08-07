import React, { FC, useCallback, useMemo, useState } from 'react';
import {
  Editor,
  EditorState,
  Modifier,
  RichUtils,
  DraftBlockRenderConfig,
  ContentState,
  ContentBlock,
  CompositeDecorator,
} from 'draft-js';
import * as Immutable from 'immutable';
import { stateFromHTML } from 'draft-js-import-html';
import { BaseField, FieldComponent } from '../../../types/field-types';
import { Button } from '../../atoms/Button';
import { stateToHTML } from './export-html-fork';
import styled from 'styled-components';
import { useDebouncedCallback } from 'use-debounce';
import { presets } from './TaggedTextField.presets';

export interface TaggedTextFieldProps extends BaseField {
  id: string;
  type: 'text-field';
  value: string;
  preset: string; // bentham
  blocks?: TagDefinition[];
  tags?: TagDefinition[];
  enableLineBreak?: boolean;
  enablePageBreak?: boolean;
  enableIllegible?: boolean;
  disabled?: boolean;
}

export type TagDefinition = {
  tag: string;
  color?: string;
  backgroundColor?: string;
  label: string;
  isHTML?: boolean;
};

type EntityDescription = {
  entityKey: string;
  blockKey: string;
  startOffset: number;
  endOffset: number;
};

// Source: https://github.com/sstur/react-rte/blob/master/src/lib/getEntityAtCursor.js
function getEntityAtOffset(block: ContentBlock, offset: number): EntityDescription | null {
  const entityKey = block.getEntityAt(offset);
  if (entityKey == null) {
    return null;
  }
  let startOffset = offset;
  while (startOffset > 0 && block.getEntityAt(startOffset - 1) === entityKey) {
    startOffset -= 1;
  }
  let endOffset = startOffset;
  const blockLength = block.getLength();
  while (endOffset < blockLength && block.getEntityAt(endOffset + 1) === entityKey) {
    endOffset += 1;
  }
  return {
    entityKey,
    blockKey: block.getKey(),
    startOffset,
    endOffset: endOffset + 1,
  };
}

// Source: https://github.com/sstur/react-rte/blob/master/src/lib/getEntityAtCursor.js
function getEntityAtCursor(editorState: EditorState): EntityDescription | null {
  const selection = editorState.getSelection();
  const startKey = selection.getStartKey();
  const startBlock = editorState.getCurrentContent().getBlockForKey(startKey);
  const startOffset = selection.getStartOffset();
  if (selection.isCollapsed()) {
    // Get the entity before the cursor (unless the cursor is at the start).
    return getEntityAtOffset(startBlock, startOffset === 0 ? startOffset : startOffset - 1);
  }
  if (startKey !== selection.getEndKey()) {
    return null;
  }
  const endOffset = selection.getEndOffset();
  const startEntityKey = startBlock.getEntityAt(startOffset);
  for (let i = startOffset; i < endOffset; i++) {
    const entityKey = startBlock.getEntityAt(i);
    if (entityKey == null || entityKey !== startEntityKey) {
      return null;
    }
  }
  return {
    entityKey: startEntityKey,
    blockKey: startBlock.getKey(),
    startOffset: startOffset,
    endOffset: endOffset,
  };
}

const Block = styled.div<{ tag: string }>`
  position: relative;
  background: rgba(5,42,68,0.05);
  padding: 28px 10px 10px;
  border-radius: 5px;
  margin: 5px 0;
  overflow: hidden;
  &:before {
    position: absolute;
    background: rgba(5,42,68,0.1);
    color: rgba(5,42,68,0.7);
    top: 0px;
    left: 0px;
    padding: 4px 6px;
    font-size: 12px;
    content: '${props => props.tag}';
  }
`;

const MainContainer = styled.div`
  background: #fff;
  border: 1px solid rgba(5, 42, 68, 0.2);
  border-radius: 3px;
  font-size: 14px;
  padding: 0.6em;

  &:focus-within {
    border-color: #005cc5;
  }
`;

const BlockWrapper: FC<any> = ({ tag, children }) => {
  return (
    <Block tag={tag}>
      {React.Children.map(children as any, (c: React.ComponentElement<any, any>) =>
        c && c.props ? c.props.children : null
      )}
    </Block>
  );
};

function tagStrategy(contentBlock: ContentBlock, callback: any, contentState?: ContentState) {
  contentBlock.findEntityRanges(character => {
    const entityKey = character.getEntity();
    if (entityKey != null) {
      const entity = contentState ? contentState.getEntity(entityKey) : null;
      return entity != null && entity.getType() === 'TAGGED_ELEMENT';
    }
    return false;
  }, callback);
}

export const TaggedTextField: FieldComponent<TaggedTextFieldProps> = ({
  value,
  id,
  updateValue,
  blocks: customBlocks,
  tags: customTags,
  enableIllegible,
  enableLineBreak,
  enablePageBreak,
  preset,
}) => {
  // Could do some fancy merging?
  const { blocks = [], tags = [] } = useMemo(() => {
    if (preset && presets[preset]) {
      return presets[preset];
    }

    return { blocks: customBlocks, tags: customTags };
  }, [customBlocks, customTags, preset]);

  const { htmlTagNames, htmlBlockNames } = useMemo(() => {
    const tagNames = [];
    const blockNames = [];
    for (const block of blocks) {
      if (block.isHTML) {
        blockNames.push(block.tag.toUpperCase());
      }
    }
    for (const tag of tags) {
      if (tag.isHTML) {
        tagNames.push(tag.tag.toUpperCase());
      }
    }
    return { htmlTagNames: tagNames, htmlBlockNames: blockNames };
  }, [blocks, tags]);

  const CustomTag = useMemo<FC<any>>(() => {
    return props => {
      const entity = props.contentState.getEntity(props.entityKey);
      const data = entity.getData();
      const tag = data.elementTag;
      const style = tags.find(t => t.tag === tag);
      if (!tag || !style) {
        return props.children;
      }

      const styleProps = {
        backgroundColor: style.backgroundColor,
        color: style.color,
      };

      if (style.isHTML) {
        return React.createElement(style.tag, { style: styleProps }, [props.children]);
      }

      return <span style={styleProps}>{props.children}</span>;
    };
  }, [tags]);

  const decorator = useMemo(() => {
    return new CompositeDecorator([
      {
        component: CustomTag,
        strategy: tagStrategy,
      },
    ]);
  }, [CustomTag]);

  const htmlConversion = useCallback(
    (inputHtml: string) => {
      return stateFromHTML(inputHtml, {
        customBlockFn(element) {
          // @todo custom blocks.
          // enableIllegible,
          // enableLineBreak,
          // enablePageBreak,

          if (htmlBlockNames.indexOf(element.tagName) !== -1) {
            return { type: element.tagName.toLowerCase() };
          }

          const dataTag = element.getAttribute('data-tag');
          if (dataTag) {
            return { type: dataTag };
          }

          return null;
        },
        customInlineFn(element, { Style, Entity }) {
          if (element.tagName === 'SPAN' || htmlTagNames.indexOf(element.tagName) !== -1) {
            return Entity('TAGGED_ELEMENT', { elementTag: element.getAttribute('data-tag') });
          }
          return null;
        },
      });
    },
    [htmlBlockNames, htmlTagNames]
  );

  const customRenderMap = useMemo(() => {
    const map: any = {};
    const blkRender: { [name: string]: (blk: ContentBlock) => string } = {};

    for (const block of blocks) {
      map[block.tag] = {
        element: block.isHTML ? block.tag : 'div',
        wrapper: <BlockWrapper tag={block.tag} />,
      };
      blkRender[block.tag] = (blk: ContentBlock) => {
        if (htmlBlockNames.indexOf(blk.getType().toUpperCase()) !== -1) {
          const tag = blk.getType();
          return `<${tag}>${blk.getText()}</${tag}>`;
        }

        return `<div data-tag="${blk.getType()}">${blk.getText()}</div>`;
      };
    }

    return Immutable.Map<DraftBlockRenderConfig>({
      ...map,
      unstyled: {
        element: 'div',
      },
    });
  }, [blocks, htmlBlockNames]);

  const [internalValue, updateInternalValue] = useState<EditorState>(
    EditorState.createWithContent(htmlConversion(value), decorator)
  );

  const blockActionCreator = (blockName: string) => () => {
    updateInternalValue(RichUtils.toggleBlockType(internalValue, blockName));
  };

  const tagActionCreator = (inputTag: string) => () => {
    const contentState = internalValue.getCurrentContent();
    const selectionState = internalValue.getSelection();
    const contentStateWithEntity = contentState.createEntity('TAGGED_ELEMENT', 'MUTABLE', {
      elementTag: inputTag,
    });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
    // const contentStateWithLink = Modifier.applyEntity(contentStateWithEntity, selectionState, entityKey) as ContentState;
    const newEditorState = EditorState.push(
      internalValue,
      Modifier.applyEntity(contentStateWithEntity, selectionState, tagName === inputTag ? null : entityKey),
      'apply-entity'
    );
    updateInternalValue(newEditorState);
  };

  const currentBlockType = useMemo(() => {
    const selection = internalValue.getSelection();
    return internalValue
      .getCurrentContent()
      .getBlockForKey(selection.getStartKey())
      .getType();
  }, [internalValue]);

  const entity = useMemo(() => {
    const contentState = internalValue.getCurrentContent();
    const e = getEntityAtCursor(internalValue);
    return e == null ? null : contentState.getEntity(e.entityKey);
  }, [internalValue]);

  const tagName = entity ? entity.getData().elementTag : undefined;

  const [updateExternalValue] = useDebouncedCallback(() => {
    const currentContent = internalValue.getCurrentContent();
    const exportedHtml = stateToHTML(currentContent, {
      // blockRenderers: blockRenderers,
      defaultBlockTag: 'div',
      blockStyleFn: blk => {
        if (blk.getType() === 'unstyled' || htmlBlockNames.indexOf(blk.getType().toUpperCase()) !== -1) {
          return { attributes: {} } as any;
        }
        return { attributes: { 'data-tag': blk.getType() } };
      },
      entityStyleFn: (e: any) => {
        const entityType = e.get('type').toLowerCase();
        const data = e.getData();
        return { element: 'span', attributes: { 'data-tag': data.elementTag } };
      },
    });

    updateValue(exportedHtml);
  }, 200);

  return (
    <MainContainer>
      <div>
        {blocks.map(block => (
          <Button
            type="button"
            size="mini"
            key={block.tag}
            selected={block.tag === currentBlockType}
            // style={{ color: block.tag === currentBlockType ? '#000' : '#999' }}
            onClick={blockActionCreator(block.tag)}
          >
            {block.label}
          </Button>
        ))}
      </div>
      <div>
        {tags.map(tag => (
          <Button
            type="button"
            size="mini"
            key={tag.tag}
            selected={tag.tag === tagName}
            // style={{ color: tag.tag === tagName ? '#000' : '#999' }}
            onClick={tagActionCreator(tag.tag)}
          >
            {tag.label}
          </Button>
        ))}
      </div>
      <br />
      <Editor
        editorState={internalValue}
        onChange={editState => {
          updateInternalValue(editState);
          updateExternalValue();
        }}
        blockRenderMap={customRenderMap}
      />
    </MainContainer>
  );
};

export default TaggedTextField;
