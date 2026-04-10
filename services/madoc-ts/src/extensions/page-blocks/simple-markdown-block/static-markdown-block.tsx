import React, { useMemo } from 'react';
import styled, { createGlobalStyle, css } from 'styled-components';

import { renderToHtml, theme as defaultTheme } from 'rich-markdown-editor';

const theme = {
  ...defaultTheme,
  background: 'transparent',
  text: 'inherit',
} as any;

// Adapted from: https://github.com/outline/rich-markdown-editor/blob/main/src/index.tsx
const StyledEditor = styled('div')<{
  readOnly?: boolean;
  readOnlyWriteCheckboxes?: boolean;
}>`
  margin: 0.5em 0;
  color: ${theme.text};
  background: ${theme.background};
  font-size: 1em;
  line-height: 1.7em;
  width: 100%;

  ${props => css`
    .block-menu-trigger {
      display: ${props.readOnly ? 'none' : 'inline'};
    }

    .image {
      img {
        pointer-events: ${props.readOnly ? 'initial' : 'none'};
      }
    }

    .ProseMirror-selectednode {
      outline: 2px solid ${props.readOnly ? 'transparent' : theme.selected};
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      &:not(.placeholder):before {
        display: ${props.readOnly ? 'none' : 'inline-block'};
      }
    }

    .heading-anchor {
      display: ${props.readOnly ? 'inline-block' : 'none'};
    }

    .placeholder {
      &:before {
        content: ${props.readOnly ? '' : 'attr(data-empty-text)'};
      }
    }

    .template-placeholder {
      &:hover {
        border-bottom: 1px dotted ${props.readOnly ? theme.placeholder : theme.textSecondary};
      }
    }

    a:hover {
      text-decoration: ${props.readOnly ? 'underline' : 'none'};
    }

    ul li::before,
    ol li::before {
      display: ${props.readOnly ? 'none' : 'inline-block'};
    }

    ul.checkbox_list li input {
      pointer-events: ${props.readOnly && !props.readOnlyWriteCheckboxes ? 'none' : 'initial'};
      opacity: ${props.readOnly && !props.readOnlyWriteCheckboxes ? 0.75 : 1};
    }

    .code-block,
    .notice-block {
      &:hover {
        select {
          display: ${props.readOnly ? 'none' : 'inline'};
        }
        button {
          display: ${props.readOnly ? 'inline' : 'none'};
        }
      }
    }

    table {
      .selectedCell {
        background: ${props.readOnly ? 'inherit' : theme.tableSelectedBackground};
      }
      .grip-column {
        display: ${props.readOnly ? 'none' : 'block'};
      }
    }

    .grip-row {
      &::after {
        display: ${props.readOnly ? 'none' : 'block'};
      }
    }

    .grid-table {
      &::after {
        display: ${props.readOnly ? 'none' : 'block'};
      }
    }
  `}
`;

const MarkdownBlockGlobalStyles = createGlobalStyle`
  .styled-editor {
    .ProseMirror {
      position: relative;
      outline: none;
      word-wrap: break-word;
      white-space: pre-wrap;
      white-space: break-spaces;
      -webkit-font-variant-ligatures: none;
      font-variant-ligatures: none;
      font-feature-settings: 'liga' 0; /* the above doesn't seem to work in Edge */
    }

    pre {
      white-space: pre-wrap;
    }

    li {
      position: relative;
    }

    img {
      display: inline-block;
      max-width: 100%;
      max-height: 75vh;
    }
    
    .image {
      text-align: center;
      max-width: 100%;
      clear: both;

      img {
        display: inline-block;
        max-width: 100%;
        max-height: 75vh;
      }
    }

    .image.placeholder {
      position: relative;
      background: ${theme.background};

      img {
        opacity: 0.5;
      }
    }

    .image-right-50 {
      float: right;
      width: 50%;
      margin-left: 2em;
      margin-bottom: 1em;
      clear: initial;
    }

    .image-left-50 {
      float: left;
      width: 50%;
      margin-right: 2em;
      margin-bottom: 1em;
      clear: initial;
    }

    .ProseMirror-hideselection *::selection {
      background: transparent;
    }

    .ProseMirror-hideselection *::-moz-selection {
      background: transparent;
    }

    .ProseMirror-hideselection {
      caret-color: transparent;
    }

    /* Make sure li selections wrap around markers */

    li.ProseMirror-selectednode {
      outline: none;
    }

    li.ProseMirror-selectednode:after {
      content: '';
      position: absolute;
      left: -32px;
      right: -2px;
      top: -2px;
      bottom: -2px;
      border: 2px solid ${theme.selected};
      pointer-events: none;
    }

    .ProseMirror[contenteditable='false'] {
      .caption {
        pointer-events: none;
      }

      .caption:empty {
        visibility: hidden;
      }
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin: 1em 0 0.5em;
      font-weight: 500;
      cursor: default;

      &:not(.placeholder):before {
        font-family: ${theme.fontFamilyMono};
        color: ${theme.textSecondary};
        font-size: 13px;
        line-height: 0;
        margin-left: -24px;
        width: 24px;
      }

      &:hover {
        .heading-anchor {
          opacity: 1;
        }
      }
    }

    .heading-content {
      &:before {
        content: '​';
        display: inline;
      }
    }

    .heading-name {
      color: ${theme.text};

      &:hover {
        text-decoration: none;
      }
    }

    a:first-child {
      h1,
      h2,
      h3,
      h4,
      h5,
      h6 {
        margin-top: 0;
      }
    }

    .with-emoji {
      margin-left: -1em;
    }

    .heading-anchor {
      opacity: 0;
      color: ${theme.textSecondary};
      cursor: pointer;
      background: none;
      border: 0;
      outline: none;
      padding: 2px 12px 2px 4px;
      margin: 0;
      transition: opacity 100ms ease-in-out;
      font-family: ${theme.fontFamilyMono};
      font-size: 22px;
      line-height: 0;
      margin-left: -24px;
      width: 24px;

      &:focus,
      &:hover {
        color: ${theme.text};
      }
    }

    .placeholder {
      &:before {
        display: block;
        pointer-events: none;
        height: 0;
        color: ${theme.placeholder};
      }
    }

    @media print {
      .placeholder {
        display: none;
      }
    }

    .notice {
      display: flex;
      align-items: center;
      background: ${theme.noticeInfoBackground};
      color: ${theme.noticeInfoText};
      border-radius: 4px;
      padding: 8px 16px;
      margin: 8px 0;

      a {
        color: ${theme.noticeInfoText};
      }

      a:not(.heading-name) {
        text-decoration: underline;
      }
    }

    // .notice-block .content {
    //   flex-grow: 1;
    // }
    // .notice-block .icon {
    //   width: 24px;
    //   height: 24px;
    //   align-self: flex-start;
    //   margin-right: 4px;
    //   position: relative;
    //   top: 1px;
    // }
    .notice-tip {
      background: ${theme.noticeTipBackground};
      color: ${theme.noticeTipText};

      a {
        color: ${theme.noticeTipText};
      }
    }

    .notice-warning {
      background: ${theme.noticeWarningBackground};
      color: ${theme.noticeWarningText};

      a {
        color: ${theme.noticeWarningText};
      }
    }

    blockquote {
      margin: 0;
      padding-left: 1.5em;
      font-style: italic;
      overflow: hidden;
      position: relative;

      &:before {
        content: '';
        display: inline-block;
        width: 2px;
        border-radius: 1px;
        position: absolute;
        margin-left: -1.5em;
        top: 0;
        bottom: 0;
        background: ${theme.quote};
      }
    }

    b,
    strong {
      font-weight: 600;
    }

    .template-placeholder {
      color: ${theme.placeholder};
      border-bottom: 1px dotted ${theme.placeholder};
      border-radius: 2px;
      cursor: text;
    }

    p {
      margin: 0;
    }

    ul,
    ol {
      margin: 0 0.1em 0 -26px;
      padding: 0 0 0 44px;

      ul,
      ol {
        margin-right: -24px;
      }
    }

    ol ol {
      list-style: lower-alpha;
    }

    ol ol ol {
      list-style: lower-roman;
    }

    ul.checkbox_list {
      list-style: none;
      padding: 0;
      margin: 0 0 0 -24px;
    }

    ul li,
    ol li {
      position: relative;
      white-space: initial;

      p {
        white-space: pre-wrap;
      }

      > div {
        width: 100%;
      }
    }

    ul.checkbox_list li {
      display: flex;
      padding-left: 24px;
    }

    ul.checkbox_list li.checked > div > p {
      color: ${theme.textSecondary};
      text-decoration: line-through;
    }

    ul li::before,
    ol li::before {
      background: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3QgeD0iOCIgeT0iNyIgd2lkdGg9IjMiIGhlaWdodD0iMiIgcng9IjEiIGZpbGw9IiM0RTVDNkUiLz4KPHJlY3QgeD0iOCIgeT0iMTEiIHdpZHRoPSIzIiBoZWlnaHQ9IjIiIHJ4PSIxIiBmaWxsPSIjNEU1QzZFIi8+CjxyZWN0IHg9IjgiIHk9IjE1IiB3aWR0aD0iMyIgaGVpZ2h0PSIyIiByeD0iMSIgZmlsbD0iIzRFNUM2RSIvPgo8cmVjdCB4PSIxMyIgeT0iNyIgd2lkdGg9IjMiIGhlaWdodD0iMiIgcng9IjEiIGZpbGw9IiM0RTVDNkUiLz4KPHJlY3QgeD0iMTMiIHk9IjExIiB3aWR0aD0iMyIgaGVpZ2h0PSIyIiByeD0iMSIgZmlsbD0iIzRFNUM2RSIvPgo8cmVjdCB4PSIxMyIgeT0iMTUiIHdpZHRoPSIzIiBoZWlnaHQ9IjIiIHJ4PSIxIiBmaWxsPSIjNEU1QzZFIi8+Cjwvc3ZnPgo=');
      content: '';
      cursor: move;
      width: 24px;
      height: 24px;
      position: absolute;
      left: -40px;
      top: 2px;
      opacity: 0;
      transition: opacity 200ms ease-in-out;
    }

    ul > li.hovering::before,
    ol li.hovering::before {
      opacity: 0.5;
    }

    ul li.ProseMirror-selectednode::after,
    ol li.ProseMirror-selectednode::after {
      display: none;
    }

    ul.checkbox_list li::before {
      left: 0;
    }

    ul.checkbox_list li input {
      margin: 0.5em 0.5em 0 0;
      width: 14px;
      height: 14px;
    }

    li p:first-child {
      margin: 0;
      word-break: break-word;
    }

    hr {
      height: 0;
      border: 0;
      border-top: 1px solid ${theme.horizontalRule};
    }

    code {
      border-radius: 4px;
      border: 1px solid ${theme.codeBorder};
      padding: 3px 4px;
      font-family: ${theme.fontFamilyMono};
      font-size: 85%;
    }

    mark {
      border-radius: 1px;
      color: ${theme.textHighlightForeground};
      background: ${theme.textHighlight};

      a {
        color: ${theme.textHighlightForeground};
      }
    }

    .code-block,
    .notice-block {
      position: relative;

      select,
      button {
        background: ${theme.blockToolbarBackground};
        color: ${theme.blockToolbarItem};
        border-width: 1px;
        font-size: 13px;
        display: none;
        position: absolute;
        border-radius: 4px;
        padding: 2px;
        z-index: 1;
        top: 4px;
        right: 4px;
      }

      button {
        padding: 2px 4px;
      }

      select:focus,
      select:active {
        display: inline;
      }
    }

    pre {
      display: block;
      overflow-x: auto;
      padding: 0.75em 1em;
      line-height: 1.4em;
      position: relative;
      background: ${theme.codeBackground};
      border-radius: 4px;
      border: 1px solid ${theme.codeBorder};
      -webkit-font-smoothing: initial;
      font-family: ${theme.fontFamilyMono};
      font-size: 13px;
      direction: ltr;
      text-align: left;
      white-space: pre;
      word-spacing: normal;
      word-break: normal;
      -moz-tab-size: 4;
      -o-tab-size: 4;
      tab-size: 4;
      -webkit-hyphens: none;
      -moz-hyphens: none;
      -ms-hyphens: none;
      hyphens: none;
      color: ${theme.code};
      margin: 0;

      code {
        font-size: 13px;
        background: none;
        padding: 0;
        border: 0;
      }
    }

    .token.comment,
    .token.prolog,
    .token.doctype,
    .token.cdata {
      color: ${theme.codeComment};
    }

    .token.punctuation {
      color: ${theme.codePunctuation};
    }

    .token.namespace {
      opacity: 0.7;
    }

    .token.operator,
    .token.boolean,
    .token.number {
      color: ${theme.codeNumber};
    }

    .token.property {
      color: ${theme.codeProperty};
    }

    .token.tag {
      color: ${theme.codeTag};
    }

    .token.string {
      color: ${theme.codeString};
    }

    .token.selector {
      color: ${theme.codeSelector};
    }

    .token.attr-name {
      color: ${theme.codeAttr};
    }

    .token.entity,
    .token.url,
    .language-css .token.string,
    .style .token.string {
      color: ${theme.codeEntity};
    }

    .token.attr-value,
    .token.keyword,
    .token.control,
    .token.directive,
    .token.unit {
      color: ${theme.codeKeyword};
    }

    .token.function {
      color: ${theme.codeFunction};
    }

    .token.statement,
    .token.regex,
    .token.atrule {
      color: ${theme.codeStatement};
    }

    .token.placeholder,
    .token.variable {
      color: ${theme.codePlaceholder};
    }

    .token.deleted {
      text-decoration: line-through;
    }

    .token.inserted {
      border-bottom: 1px dotted ${theme.codeInserted};
      text-decoration: none;
    }

    .token.italic {
      font-style: italic;
    }

    .token.important,
    .token.bold {
      font-weight: bold;
    }

    .token.important {
      color: ${theme.codeImportant};
    }

    .token.entity {
      cursor: help;
    }

    p {
      display: block;
      min-height: 1.8em;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      border-radius: 4px;
      margin-top: 1em;
      box-sizing: border-box;

      * {
        box-sizing: border-box;
      }

      tr {
        position: relative;
        border-bottom: 1px solid ${theme.tableDivider};
      }

      th {
        background: ${theme.tableHeaderBackground};
      }

      td,
      th {
        position: relative;
        vertical-align: top;
        border: 1px solid ${theme.tableDivider};
        position: relative;
        padding: 4px 8px;
        text-align: left;
        min-width: 100px;
      }

      .selectedCell {
        /* fixes Firefox background color painting over border:
         * https://bugzilla.mozilla.org/show_bug.cgi?id=688556 */
        background-clip: padding-box;
      }

      .grip-column {
        /* usage of ::after for all of the table grips works around a bug in
         * prosemirror-tables that causes Safari to hang when selecting a cell
         * in an empty table:
         * https://github.com/ProseMirror/prosemirror/issues/947 */

        &::after {
          content: '';
          cursor: pointer;
          position: absolute;
          top: -16px;
          left: 0;
          width: 100%;
          height: 12px;
          background: ${theme.tableDivider};
          border-bottom: 3px solid ${theme.background};
        }

        &:hover::after {
          background: ${theme.text};
        }

        &.first::after {
          border-top-left-radius: 3px;
        }

        &.last::after {
          border-top-right-radius: 3px;
        }

        &.selected::after {
          background: ${theme.tableSelected};
        }
      }

      .grip-row {
        &::after {
          content: '';
          cursor: pointer;
          position: absolute;
          left: -16px;
          top: 0;
          height: 100%;
          width: 12px;
          background: ${theme.tableDivider};
          border-right: 3px solid ${theme.background};
        }

        &:hover::after {
          background: ${theme.text};
        }

        &.first::after {
          border-top-left-radius: 3px;
        }

        &.last::after {
          border-bottom-left-radius: 3px;
        }

        &.selected::after {
          background: ${theme.tableSelected};
        }
      }

      .grip-table {
        &::after {
          content: '';
          cursor: pointer;
          background: ${theme.tableDivider};
          width: 13px;
          height: 13px;
          border-radius: 13px;
          border: 2px solid ${theme.background};
          position: absolute;
          top: -18px;
          left: -18px;
        }

        &:hover::after {
          background: ${theme.text};
        }

        &.selected::after {
          background: ${theme.tableSelected};
        }
      }
    }

    .scrollable-wrapper {
      position: relative;
      margin: 0.5em 0px;
      scrollbar-width: thin;
      scrollbar-color: transparent transparent;

      &:hover {
        scrollbar-color: ${theme.scrollbarThumb} ${theme.scrollbarBackground};
      }

      & ::-webkit-scrollbar {
        height: 14px;
        background-color: transparent;
      }

      &:hover ::-webkit-scrollbar {
        background-color: ${theme.scrollbarBackground};
      }

      & ::-webkit-scrollbar-thumb {
        background-color: transparent;
        border: 3px solid transparent;
        border-radius: 7px;
      }

      &:hover ::-webkit-scrollbar-thumb {
        background-color: ${theme.scrollbarThumb};
        border-color: ${theme.scrollbarBackground};
      }
    }

    .scrollable {
      overflow-y: hidden;
      overflow-x: auto;
      padding-left: 1em;
      margin-left: -1em;
      border-left: 1px solid transparent;
      border-right: 1px solid transparent;
      transition: border 250ms ease-in-out 0s;
    }

    .scrollable-shadow {
      position: absolute;
      top: 0;
      bottom: 0;
      left: -1em;
      width: 16px;
      transition: box-shadow 250ms ease-in-out;
      border: 0px solid transparent;
      border-left-width: 1em;
      pointer-events: none;

      &.left {
        box-shadow: 16px 0 16px -16px inset rgba(0, 0, 0, 0.25);
        border-left: 1em solid ${theme.background};
      }

      &.right {
        right: 0;
        left: auto;
        box-shadow: -16px 0 16px -16px inset rgba(0, 0, 0, 0.25);
      }
    }

    .block-menu-trigger {
      width: 24px;
      height: 24px;
      color: ${theme.textSecondary};
      background: none;
      position: absolute;
      transition: color 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275),
      transform 150ms cubic-bezier(0.175, 0.885, 0.32, 1.275);
      outline: none;
      border: 0;
      padding: 0;
      margin-top: 1px;
      margin-left: -24px;

      &:hover,
      &:focus {
        cursor: pointer;
        transform: scale(1.2);
        color: ${theme.text};
      }
    }

    @media print {
      .block-menu-trigger {
        display: none;
      }
    }

    .ProseMirror-gapcursor {
      display: none;
      pointer-events: none;
      position: absolute;
    }

    .ProseMirror-gapcursor:after {
      content: '';
      display: block;
      position: absolute;
      top: -2px;
      width: 20px;
      border-top: 1px solid ${theme.cursor};
      animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
    }

    @keyframes ProseMirror-cursor-blink {
      to {
        visibility: hidden;
      }
    }

    .ProseMirror-focused .ProseMirror-gapcursor {
      display: block;
    }

    @media print {
      em,
      blockquote {
        font-family: 'SF Pro Text', ${theme.fontFamily};
      }
    }
  }
` as any;

export const StaticMarkdownBlock: React.FC<{ markdown: string }> = ({ markdown }) => {
  const htmlContent = useMemo(() => {
    return renderToHtml(markdown);
  }, [markdown]);

  return (
    <>
      <MarkdownBlockGlobalStyles />
      <StyledEditor className="styled-editor" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </>
  );
};
