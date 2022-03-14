/* eslint-disable */
import { ContentState, ContentBlock, Entity, EntityInstance } from 'draft-js';

import {
  getEntityRanges,
  BLOCK_TYPE,
  ENTITY_TYPE,
  INLINE_STYLE,
  // @ts-ignore
} from 'draft-js-utils';

type AttrMap = { [key: string]: string };
type Attributes = { [key: string]: string };
type StyleDescr = { [key: string]: number | string };

type RenderConfig = {
  element?: string;
  attributes?: Attributes;
  style?: StyleDescr;
};

type BlockRenderer = (block: ContentBlock) => string;
type BlockRendererMap = { [blockType: string]: BlockRenderer };

type StyleMap = { [styleName: string]: RenderConfig };

type BlockStyleFn = (block: ContentBlock) => RenderConfig;
type EntityStyleFn = (entity: Entity) => RenderConfig;
type InlineStyleFn = (style: any) => RenderConfig;

type Options = {
  inlineStyles?: StyleMap;
  inlineStyleFn?: InlineStyleFn;
  blockRenderers?: BlockRendererMap;
  blockStyleFn?: BlockStyleFn;
  entityStyleFn?: EntityStyleFn;
  defaultBlockTag?: string;
};

const VENDOR_PREFIX = /^(moz|ms|o|webkit)-/;
const NUMERIC_STRING = /^\d+$/;
const UPPERCASE_PATTERN = /([A-Z])/g;

// Lifted from:
// https://github.com/facebook/react/blob/ab4ddf64939aebbbc8d31be1022efd56e834c95c/src/renderers/dom/shared/CSSProperty.js
const isUnitlessNumber = {
  animationIterationCount: true,
  borderImageOutset: true,
  borderImageSlice: true,
  borderImageWidth: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  gridRow: true,
  gridRowEnd: true,
  gridRowSpan: true,
  gridRowStart: true,
  gridColumn: true,
  gridColumnEnd: true,
  gridColumnSpan: true,
  gridColumnStart: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,
  // SVG-related properties
  fillOpacity: true,
  floodOpacity: true,
  stopOpacity: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true,
};

// Lifted from: https://github.com/facebook/react/blob/master/src/renderers/dom/shared/CSSPropertyOperations.js
function processStyleName(name: string): string {
  return name
    .replace(UPPERCASE_PATTERN, '-$1')
    .toLowerCase()
    .replace(VENDOR_PREFIX, '-$1-');
}

// Lifted from: https://github.com/facebook/react/blob/master/src/renderers/dom/shared/dangerousStyleValue.js
function processStyleValue(name: string, value: number | string): string {
  let isNumeric;
  if (typeof value === 'string') {
    isNumeric = NUMERIC_STRING.test(value);
  } else {
    isNumeric = true;
    value = String(value);
  }
  if (!isNumeric || value === '0' || (isUnitlessNumber as any)[name] === true) {
    return value;
  } else {
    return value + 'px';
  }
}

function styleToCSS(styleDescr: StyleDescr): string {
  return Object.keys(styleDescr)
    .map(name => {
      const styleValue = processStyleValue(name, styleDescr[name]);
      const styleName = processStyleName(name);
      return `${styleName}: ${styleValue}`;
    })
    .join('; ');
}

// Lifted from: https://github.com/facebook/react/blob/master/src/renderers/dom/shared/HTMLDOMPropertyConfig.js
const ATTR_NAME_MAP = {
  acceptCharset: 'accept-charset',
  className: 'class',
  htmlFor: 'for',
  httpEquiv: 'http-equiv',
};

function normalizeAttributes(attributes: Attributes) {
  if (attributes == null) {
    return attributes;
  }
  const normalized = {};
  let didNormalize = false;
  for (const name of Object.keys(attributes)) {
    let newName = name;
    if (ATTR_NAME_MAP.hasOwnProperty(name)) {
      newName = (ATTR_NAME_MAP as any)[name];
      didNormalize = true;
    }
    (normalized as any)[newName] = attributes[name];
  }
  return didNormalize ? normalized : attributes;
}

const { BOLD, CODE, ITALIC, STRIKETHROUGH, UNDERLINE } = INLINE_STYLE;

function combineOrderedStyles(customMap: StyleMap, defaults: any): any {
  if (customMap == null) {
    return defaults;
  }
  const [defaultStyleMap, defaultStyleOrder] = defaults;
  const styleMap = { ...defaultStyleMap };
  const styleOrder = [...defaultStyleOrder];
  for (const styleName of Object.keys(customMap)) {
    if (defaultStyleMap.hasOwnProperty(styleName)) {
      const defaultStyles = defaultStyleMap[styleName];
      styleMap[styleName] = { ...defaultStyles, ...customMap[styleName] };
    } else {
      styleMap[styleName] = customMap[styleName];
      styleOrder.push(styleName);
    }
  }
  return [styleMap, styleOrder];
}

const INDENT = '  ';
const BREAK = '<br>';
const DATA_ATTRIBUTE = /^data-([a-z0-9-]+)$/;

const DEFAULT_STYLE_MAP = {
  [BOLD]: { element: 'strong' },
  [CODE]: { element: 'code' },
  [ITALIC]: { element: 'em' },
  [STRIKETHROUGH]: { element: 'del' },
  [UNDERLINE]: { element: 'u' },
};

// Order: inner-most style to outer-most.
// Examle: <em><strong>foo</strong></em>
const DEFAULT_STYLE_ORDER = [BOLD, ITALIC, UNDERLINE, STRIKETHROUGH, CODE];

// Map entity data to element attributes.
const ENTITY_ATTR_MAP: { [entityType: string]: AttrMap } = {
  [ENTITY_TYPE.LINK]: {
    url: 'href',
    href: 'href',
    rel: 'rel',
    target: 'target',
    title: 'title',
    className: 'class',
  },
  [ENTITY_TYPE.IMAGE]: {
    src: 'src',
    height: 'height',
    width: 'width',
    alt: 'alt',
    className: 'class',
  },
};

// Map entity data to element attributes.
const DATA_TO_ATTR = {
  [ENTITY_TYPE.LINK](entityType: string, entity: EntityInstance): Attributes {
    const attrMap = ENTITY_ATTR_MAP.hasOwnProperty(entityType) ? ENTITY_ATTR_MAP[entityType] : {};
    const data = entity.getData();
    const attrs: any = {};
    for (const dataKey of Object.keys(data)) {
      const dataValue = data[dataKey];
      if (attrMap.hasOwnProperty(dataKey)) {
        const attrKey = attrMap[dataKey];
        attrs[attrKey] = dataValue;
      } else if (DATA_ATTRIBUTE.test(dataKey)) {
        attrs[dataKey] = dataValue;
      }
    }
    return attrs;
  },
  [ENTITY_TYPE.IMAGE](entityType: string, entity: EntityInstance): Attributes {
    const attrMap = ENTITY_ATTR_MAP.hasOwnProperty(entityType) ? ENTITY_ATTR_MAP[entityType] : {};
    const data = entity.getData();
    const attrs: any = {};
    for (const dataKey of Object.keys(data)) {
      const dataValue = data[dataKey];
      if (attrMap.hasOwnProperty(dataKey)) {
        const attrKey = attrMap[dataKey];
        attrs[attrKey] = dataValue;
      } else if (DATA_ATTRIBUTE.test(dataKey)) {
        attrs[dataKey] = dataValue;
      }
    }
    return attrs;
  },
};

// The reason this returns an array is because a single block might get wrapped
// in two tags.
function getTags(blockType: string, defaultBlockTag: any): Array<string> {
  switch (blockType) {
    case BLOCK_TYPE.HEADER_ONE:
      return ['h1'];
    case BLOCK_TYPE.HEADER_TWO:
      return ['h2'];
    case BLOCK_TYPE.HEADER_THREE:
      return ['h3'];
    case BLOCK_TYPE.HEADER_FOUR:
      return ['h4'];
    case BLOCK_TYPE.HEADER_FIVE:
      return ['h5'];
    case BLOCK_TYPE.HEADER_SIX:
      return ['h6'];
    case BLOCK_TYPE.UNORDERED_LIST_ITEM:
    case BLOCK_TYPE.ORDERED_LIST_ITEM:
      return ['li'];
    case BLOCK_TYPE.BLOCKQUOTE:
      return ['blockquote'];
    case BLOCK_TYPE.CODE:
      return ['pre', 'code'];
    case BLOCK_TYPE.ATOMIC:
      return ['figure'];
    case BLOCK_TYPE.UNSTYLED:
      return [defaultBlockTag];
    default:
      return [blockType];
  }
}

function getWrapperTag(blockType: string): string | null {
  switch (blockType) {
    case BLOCK_TYPE.UNORDERED_LIST_ITEM:
      return 'ul';
    case BLOCK_TYPE.ORDERED_LIST_ITEM:
      return 'ol';
    default:
      return null;
  }
}

class MarkupGenerator {
  // These are related to state.
  blocks: Array<ContentBlock> = [];
  contentState: ContentState;
  currentBlock = 0;
  indentLevel = 0;
  output: Array<string> = [];
  totalBlocks = 0;
  wrapperTag?: string | null;
  // These are related to user-defined options.
  options: Options;
  inlineStyles: StyleMap;
  inlineStyleFn: InlineStyleFn;
  styleOrder: Array<string>;

  constructor(contentState: ContentState, options: Options) {
    if (options == null) {
      options = {};
    }
    this.contentState = contentState;
    this.options = options;
    const [inlineStyles, styleOrder] = combineOrderedStyles(options.inlineStyles as any, [
      DEFAULT_STYLE_MAP,
      DEFAULT_STYLE_ORDER,
    ]);
    this.inlineStyles = inlineStyles;
    this.inlineStyleFn = options.inlineStyleFn as any;
    this.styleOrder = styleOrder;
  }

  generate(): string {
    this.output = [];
    this.blocks = this.contentState.getBlocksAsArray();
    this.totalBlocks = this.blocks.length;
    this.currentBlock = 0;
    this.indentLevel = 0;
    this.wrapperTag = null;
    while (this.currentBlock < this.totalBlocks) {
      this.processBlock();
    }
    this.closeWrapperTag();
    return this.output.join('').trim();
  }

  processBlock() {
    const { blockRenderers, defaultBlockTag } = this.options;
    const block = this.blocks[this.currentBlock as any];
    const blockType = block.getType();
    const newWrapperTag = getWrapperTag(blockType);
    if (this.wrapperTag !== newWrapperTag) {
      if (this.wrapperTag) {
        this.closeWrapperTag();
      }
      if (newWrapperTag) {
        this.openWrapperTag(newWrapperTag);
      }
    }
    this.indent();
    // Allow blocks to be rendered using a custom renderer.
    const customRenderer =
      blockRenderers != null && blockRenderers.hasOwnProperty(blockType) ? blockRenderers[blockType] : null;
    const customRendererOutput = customRenderer ? customRenderer(block) : null;
    // Renderer can return null, which will cause processing to continue as normal.
    if (customRendererOutput != null) {
      this.output.push(customRendererOutput);
      this.output.push('\n');
      this.currentBlock += 1;
      return;
    }
    this.writeStartTag(block, defaultBlockTag);
    this.output.push(this.renderBlockContent(block));
    // Look ahead and see if we will nest list.
    const nextBlock = this.getNextBlock();
    if (canHaveDepth(blockType) && nextBlock && nextBlock.getDepth() === block.getDepth() + 1) {
      this.output.push('\n');
      // This is a litle hacky: temporarily stash our current wrapperTag and
      // render child list(s).
      const thisWrapperTag = this.wrapperTag;
      this.wrapperTag = null;
      this.indentLevel += 1;
      this.currentBlock += 1;
      this.processBlocksAtDepth(nextBlock.getDepth());
      this.wrapperTag = thisWrapperTag;
      this.indentLevel -= 1;
      this.indent();
    } else {
      this.currentBlock += 1;
    }
    this.writeEndTag(block, defaultBlockTag);
  }

  processBlocksAtDepth(depth: number) {
    let block = this.blocks[this.currentBlock];
    while (block && block.getDepth() === depth) {
      this.processBlock();
      block = this.blocks[this.currentBlock];
    }
    this.closeWrapperTag();
  }

  getNextBlock(): ContentBlock {
    return this.blocks[this.currentBlock + 1];
  }

  writeStartTag(block: any, defaultBlockTag: any) {
    const tags = getTags(block.getType(), defaultBlockTag);

    let attrString;
    if (this.options.blockStyleFn) {
      let { attributes, style } = this.options.blockStyleFn(block) || {};
      // Normalize `className` -> `class`, etc.
      attributes = normalizeAttributes(attributes as any);
      if (style != null) {
        const styleAttr = styleToCSS(style);
        attributes = attributes == null ? { style: styleAttr } : { ...attributes, style: styleAttr };
      }
      attrString = stringifyAttrs(attributes);
    } else {
      attrString = '';
    }

    for (const tag of tags) {
      this.output.push(`<${tag}${attrString}>`);
    }
  }

  writeEndTag(block: any, defaultBlockTag: any) {
    const tags = getTags(block.getType(), defaultBlockTag);
    if (tags.length === 1) {
      this.output.push(`</${tags[0]}>\n`);
    } else {
      const output = [];
      for (const tag of tags) {
        output.unshift(`</${tag}>`);
      }
      this.output.push(output.join('') + '\n');
    }
  }

  openWrapperTag(wrapperTag: string) {
    this.wrapperTag = wrapperTag;
    this.indent();
    this.output.push(`<${wrapperTag}>\n`);
    this.indentLevel += 1;
  }

  closeWrapperTag() {
    const { wrapperTag } = this;
    if (wrapperTag) {
      this.indentLevel -= 1;
      this.indent();
      this.output.push(`</${wrapperTag}>\n`);
      this.wrapperTag = null;
    }
  }

  indent() {
    this.output.push(INDENT.repeat(this.indentLevel));
  }

  withCustomInlineStyles(content: any, styleSet: any) {
    if (!this.inlineStyleFn) {
      return content;
    }

    const renderConfig = this.inlineStyleFn(styleSet);
    if (!renderConfig) {
      return content;
    }

    const { element = 'span', attributes, style } = renderConfig;
    const attrString = stringifyAttrs({
      ...attributes,
      style: style && styleToCSS(style),
    } as any);

    return `<${element}${attrString}>${content}</${element}>`;
  }

  renderBlockContent(block: ContentBlock): string {
    const blockType = block.getType();
    let text = block.getText();
    if (text === '') {
      // Prevent element collapse if completely empty.
      return BREAK;
    }
    text = this.preserveWhitespace(text);
    const charMetaList: any = block.getCharacterList();
    const entityPieces = getEntityRanges(text, charMetaList);
    return entityPieces
      .map(([entityKey, stylePieces]: any) => {
        const content = stylePieces
          .map(([text, styleSet]: any) => {
            let content = encodeContent(text);
            for (const styleName of this.styleOrder) {
              // If our block type is CODE then don't wrap inline code elements.
              if (styleName === CODE && blockType === BLOCK_TYPE.CODE) {
                continue;
              }
              if (styleSet.has(styleName)) {
                let { element, attributes, style } = this.inlineStyles[styleName];
                if (element == null) {
                  element = 'span';
                }
                // Normalize `className` -> `class`, etc.
                attributes = normalizeAttributes(attributes as any);
                if (style != null) {
                  const styleAttr = styleToCSS(style);
                  attributes = attributes == null ? { style: styleAttr } : { ...attributes, style: styleAttr };
                }
                const attrString = stringifyAttrs(attributes);
                content = `<${element}${attrString}>${content}</${element}>`;
              }
            }

            return this.withCustomInlineStyles(content, styleSet);
          })
          .join('');
        const entity = entityKey ? this.contentState.getEntity(entityKey) : null;
        // Note: The `toUpperCase` below is for compatability with some libraries that use lower-case for image blocks.
        const entityType = entity == null ? null : entity.getType().toUpperCase();
        let entityStyle;
        if (entity != null && this.options.entityStyleFn && (entityStyle = this.options.entityStyleFn(entity))) {
          let { element, attributes, style } = entityStyle;
          if (element == null) {
            element = 'span';
          }
          // Normalize `className` -> `class`, etc.
          attributes = normalizeAttributes(attributes as any);
          if (style != null) {
            const styleAttr = styleToCSS(style);
            attributes = attributes == null ? { style: styleAttr } : { ...attributes, style: styleAttr };
          }
          const attrString = stringifyAttrs(attributes);
          return `<${element}${attrString}>${content}</${element}>`;
        } else if (entityType != null && entityType === ENTITY_TYPE.LINK) {
          const attrs = DATA_TO_ATTR.hasOwnProperty(entityType)
            ? DATA_TO_ATTR[entityType as any](entityType, entity as any)
            : null;
          const attrString = stringifyAttrs(attrs as any);
          return `<a${attrString}>${content}</a>`;
        } else if (entityType != null && entityType === ENTITY_TYPE.IMAGE) {
          const attrs = DATA_TO_ATTR.hasOwnProperty(entityType)
            ? DATA_TO_ATTR[entityType as any](entityType, entity as any)
            : null;
          const attrString = stringifyAttrs(attrs as any);
          return `<img${attrString}/>`;
        } else {
          return content;
        }
      })
      .join('');
  }

  preserveWhitespace(text: string): string {
    const length = text.length;
    // Prevent leading/trailing/consecutive whitespace collapse.
    const newText = new Array(length);
    for (let i = 0; i < length; i++) {
      if (text[i] === ' ' && (i === 0 || i === length - 1 || text[i - 1] === ' ')) {
        newText[i] = '\xA0';
      } else {
        newText[i] = text[i];
      }
    }
    return newText.join('');
  }
}

function stringifyAttrs(attrs: Attributes) {
  if (attrs == null) {
    return '';
  }
  const parts = [];
  for (const name of Object.keys(attrs)) {
    const value = attrs[name];
    if (value != null) {
      parts.push(` ${name}="${encodeAttr(value + '')}"`);
    }
  }
  return parts.join('');
}

function canHaveDepth(blockType: string): boolean {
  switch (blockType) {
    case BLOCK_TYPE.UNORDERED_LIST_ITEM:
    case BLOCK_TYPE.ORDERED_LIST_ITEM:
      return true;
    default:
      return false;
  }
}

function encodeContent(text: string): string {
  return text
    .split('&')
    .join('&amp;')
    .split('<')
    .join('&lt;')
    .split('>')
    .join('&gt;')
    .split('\xA0')
    .join('&nbsp;')
    .split('\n')
    .join(BREAK + '\n');
}

function encodeAttr(text: string): string {
  return text
    .split('&')
    .join('&amp;')
    .split('<')
    .join('&lt;')
    .split('>')
    .join('&gt;')
    .split('"')
    .join('&quot;');
}

export function stateToHTML(content: ContentState, options: Options): string {
  return new MarkupGenerator(content, options).generate();
}
