import styled, { css } from 'styled-components';

export const Grid = styled.div<{ padded?: boolean }>`
  display: flex;
  margin: 0 -0.75em;
  ${props =>
    props.padded &&
    css`
      padding: 0.75em;
    `}
`;
export const GridColumn = styled.div<{ fluid?: boolean; half?: boolean; center?: boolean; padded?: boolean }>`
  ${({ padded = true }) =>
    padded &&
    css`
      padding: 0.75em;
    `}
  ${props =>
    props.fluid &&
    css`
      flex: 1 1 0px;
    `}
  ${props =>
    props.half &&
    css`
      width: 50%;
    `}
  ${props =>
    props.center &&
    css`
      align-self: center;
    `}
`;
export const GridRow = styled.div`
  display: flex;
`;
