import styled, { css } from 'styled-components';

export const HotSpot = styled.div<{ $size: 'lg' | 'md' | 'sm'; $active?: boolean }>`
  position: absolute;
  height: 12px;
  width: 12px;
  left: -4px;
  top: -4px;
  border-radius: 50%;
  pointer-events: all;
  cursor: pointer;

  ${props => {
    const $size = props.$size || 'md';
    switch ($size) {
      case 'sm': {
        if (props.$active) {
          return css`
            transition: background 0.4s;
            background: #5197d8;
          `;
        }
        return css`
          transition: background 0.4s;
          background: #97c0e8;
          &:hover {
            background: #5197d8;
          }
        `;
      }
      case 'md': {
        if (props.$active) {
          return css`
            transition: box-shadow 0.4s;
            background: #5197d8;
            box-shadow: 0 0 0 0 rgba(81, 151, 216, 0);
          `;
        }
        return css`
          transition: box-shadow 0.4s;
          background: #5197d8;
          box-shadow: 0 0 0 3px rgba(81, 151, 216, 0.6);

          &:hover {
            background: #5197d8;
            box-shadow: 0 0 0 0 rgba(81, 151, 216, 0);
          }
        `;
      }
      case 'lg': {
        if (props.$active) {
          return css`
            transition: box-shadow 0.4s;
            background: #5197d8;
            box-shadow: 0 0 0 0 rgba(81, 151, 216, 0);
          `;
        }
        return css`
          transition: box-shadow 0.4s;
          background: #5197d8;
          box-shadow: 0 0 0 6px rgba(81, 151, 216, 0.6);

          &:hover {
            background: #5197d8;
            box-shadow: 0 0 0 3px rgba(81, 151, 216, 0);
          }
        `;
      }
    }
  }}
`;
