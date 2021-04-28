import styled, { css } from 'styled-components';

export const GridContainer = styled.div<{ $justify?: string }>`
  display: flex;
  justify-content: ${props => props.$justify};
  align-items: flex-start;
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

export const GridSidebar = styled.div`
  max-width: 300px;
`;
