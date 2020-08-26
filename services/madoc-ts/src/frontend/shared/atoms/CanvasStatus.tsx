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
          width: 5%;
        `;
      case 2:
        return css`
          background: #a57d65;
          width: 50%;
        `;
      case 3:
        return css`
          background: #7fab76;
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
