import React from 'react';
import styled, { css } from 'styled-components';
import { ErrorBoundary } from '../utility/error-boundary';

export const WidePageWrapper = styled.div<{ $noPadding?: boolean }>`
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 20px;

  ${props =>
    props.$noPadding &&
    css`
      padding: 0;
    `}
`;

export const WidePage: typeof WidePageWrapper = ((props: any) => {
  return (
    <ErrorBoundary>
      <WidePageWrapper {...props} />
    </ErrorBoundary>
  );
}) as any;
