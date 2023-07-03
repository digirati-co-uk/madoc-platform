import styled, { css } from 'styled-components';

export const GridContainer = styled.div<{ $justify?: string }>`
  display: flex;
  justify-content: ${props => props.$justify};
  align-items: flex-start;
`;

export const GridButton = styled.button`
  display: flex;
  width: 191px;
  height: 100%;
  padding: 8px 10px;
  flex-direction: column;
  justify-content: center;
  border: 1px dashed #999;
  background-color: #f7f7f7;
  color: #3498db;
  text-decoration: none;
`;

export const CSSThirdGrid = styled.div<{ $justify?: string }>`
  display: grid;
  grid-template-columns: auto auto auto 1fr;
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
