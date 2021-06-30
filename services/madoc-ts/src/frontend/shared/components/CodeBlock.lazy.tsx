import React from 'react';
import { useApi } from '../hooks/use-api';

const CodeBlockLazy = React.lazy(() => import('./CodeBlock'));

export const CodeBlock: React.FC = ({ children, ...props }) => {
  const api = useApi();

  const fallback = <pre>{children}</pre>;

  if (api.getIsServer()) {
    return fallback;
  }

  return (
    <React.Suspense fallback={() => fallback}>
      <CodeBlockLazy {...props}>{children}</CodeBlockLazy>
    </React.Suspense>
  );
};
