import React from 'react';
import styled from 'styled-components';

import { HTMLFieldProps } from './HTMLField';

export const HTMLPreviewContainer = styled.div`
  font-size: 1em;
  line-height: 1.5em;

  * {
    font-family: inherit;
    font-size: 1em;
  }

  code {
    display: inline;
    font-family: 'Inconsolata', 'Menlo', 'Consolas', monospace;
    background-color: rgba(5, 42, 68, 0.1);
    border-radius: 3px;
    padding: 0.1em 0.4em;
  }

  pre > code {
    display: block;
    padding: 0.65em;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0.5em 0;
  }
  h1 {
    font-size: 1.75em;
  }

  blockquote {
    margin: 0.65em 0;
    padding-left: 0.65em;
    font-style: italic;
    border-left: 3px solid rgba(5, 42, 68, 0.4);
    font-family: inherit;
  }
  p,
  header,
  footer,
  main {
    margin: 0.85em 0;
  }
  header {
    border-bottom: 1px solid rgba(5, 42, 68, 0.2);
  }
  footer {
    border-top: 1px solid rgba(5, 42, 68, 0.2);
  }

  em {
    font-style: italic;
  }
  strong {
    font-weight: 600;
  }
  u {
    text-decoration: underline;
  }
  ul,
  ol {
    margin: 0.85em 0 0.85em 2em;
    padding: 0;
    & ul,
    & ol {
      margin-top: 0;
      margin-bottom: 0;
    }
  }
  li {
    padding: 0;
  }
`;

export const HTMLFieldPreview: React.FC<HTMLFieldProps> = ({ value }) => {
  if (!value) {
    return <span style={{ color: '#999' }}>No value</span>;
  }

  return <HTMLPreviewContainer dangerouslySetInnerHTML={{ __html: value }} />;
};
