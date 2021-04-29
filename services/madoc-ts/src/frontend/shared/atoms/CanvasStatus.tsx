import styled, { css } from 'styled-components';
import React from 'react';

export const CanvasStatusBackground = styled.div`
  background: #ddd;
  height: 10px;
`;

export const CanvasStatusItem = styled.div<{ $status: number }>`
  height: 10px;
  ${props => {
    switch (props.$status) {
      case 1:
        return css`
          background: #5b82d8;
          width: 10%;
        `;
      case 2:
        return css`
          background: #bf7b47;
          width: 65%;
        `;
      case 3:
        return css`
          background: #6da961;
          width: 100%;
        `;
    }
  }}
`;

export const CanvasStatus: React.FC<{ status: number }> = ({ status }) => {
  return (
    <CanvasStatusBackground>
      <CanvasStatusItem $status={status} />
    </CanvasStatusBackground>
  );
};
