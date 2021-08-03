import React from 'react';
import styled from 'styled-components';
import { useApi } from '../hooks/use-api';

const CodeBlockLazy = React.lazy(() => import('./CodeBlock'));

const PreFallback = styled.pre`
  background: #f4f5f7;
  border-radius: 5px;
  padding: 0.2em;
`;

export const CodeBlock: React.FC = ({ children, ...props }) => {
  const api = useApi();

  const fallback = <PreFallback>{children}</PreFallback>;

  if (api.getIsServer()) {
    return fallback;
  }

  return (
    <React.Suspense fallback={fallback}>
      <CodeBlockLazy {...props}>{children}</CodeBlockLazy>
    </React.Suspense>
  );
};
