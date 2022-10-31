import React from 'react';
import styled from 'styled-components';
import { BrowserComponent } from '../utility/browser-component';

const CodeBlockLazy = React.lazy(() => import('./CodeBlock'));

const PreFallback = styled.pre`
  background: #f4f5f7;
  border-radius: 5px;
  padding: 0.2em;
`;

export const CodeBlock: React.FC = ({ children, ...props }) => {
  const fallback = <PreFallback>{children}</PreFallback>;

  return (
    <BrowserComponent fallback={fallback}>
      <CodeBlockLazy {...props}>{children}</CodeBlockLazy>
    </BrowserComponent>
  );
};
