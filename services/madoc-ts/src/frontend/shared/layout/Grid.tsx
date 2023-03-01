import styled, { css } from 'styled-components';

export const GridContainer = styled.div<{ $justify?: string }>`
  display: flex;
  justify-content: ${props => props.$justify};
  align-items: flex-start;
  width: 100%;
`;

export const CSSThirdGrid = styled.div<{ $justify?: string }>`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 1em;
  justify-content: ${props => props.$justify};
  align-items: flex-start;
  overflow-y: auto;
`;

export const HalfGird = styled.div<{ $margin?: boolean }>`
  width: 50%;
  ${props =>
    props.$margin &&
    css`
      & ~ & {
        margin-left: 1em;
      }
    `}
`;

export const ThirdGrid = styled.div<{ $margin?: boolean }>`
  width: 33.333333%;
  ${props =>
    props.$margin &&
    css`
      & ~ & {
        margin-left: 1em;
      }
    `}
`;

export const ExpandGrid = styled.div`
  flex: 1 1 0px;
`;
