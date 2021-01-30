import React from 'react';
import styled from 'styled-components';
import { ErrorBoundary } from '../utility/error-boundary';

export const WidePageWrapper = styled.div`
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 20px;
`;

export const WidePage: typeof WidePageWrapper = ((props: any) => {
  return (
    <ErrorBoundary>
      <WidePageWrapper {...props} />
    </ErrorBoundary>
  );
}) as any;
