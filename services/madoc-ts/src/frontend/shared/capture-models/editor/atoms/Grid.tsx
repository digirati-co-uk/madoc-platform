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
export const GridColumn = styled.div<{ fluid?: boolean; half?: boolean }>`
  padding: 0.75em;
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
`;
export const GridRow = styled.div`
  display: flex;
`;
