import styled, { css } from 'styled-components';

export const EditorToolbarContainer = styled.div`
  background: #fff;
  display: flex;
  overflow: hidden;
  align-items: center;
  border: 1px solid #eee;
  height: 50px;
  min-height: 50px;
  border-radius: 5px;
  margin: 0.5em 0;
`;

export const EditorToolbarButton = styled.button<{ $rightBorder?: boolean; $leftBorder?: boolean }>`
  display: flex;
  padding: 0.25em 0.5em;
  height: 100%;
  cursor: pointer;
  text-decoration: none;
  color: rgba(43, 43, 43, 0.8);
  background: transparent;
  border-radius: 0;
  border: none;
  font-size: 1em;
  &:hover {
    background: #f9f9f9;
    color: rgba(0, 0, 0, 1);
  }
  &:focus {
    outline: none;
    color: #fff;
    background: #3766f2;
  }
  &:disabled {
    color: rgba(0, 0, 0, 0.3);
    cursor: not-allowed;
    &:hover {
      background: transparent;
    }
  }
  //& ~ & {
  //  border-left: 1px solid #eee;
  //}
  ${props =>
    props.$rightBorder &&
    css`
      border-right: 1px solid #eee;
    `}
  ${props =>
    props.$leftBorder &&
    css`
      border-left: 1px solid #eee;
    `}
`;

export const EditorToolbarLabel = styled.div`
  font-size: 0.8em;
  align-self: center;
  margin-right: 0.5em;
`;

export const EditorToolbarIcon = styled.div`
  font-size: 1.4em;
  align-self: center;
  display: flex;
  margin: 0.25em;
  svg {
    fill: currentColor;
  }
  & ~ ${EditorToolbarLabel} {
    margin-left: 0.5em;
  }
`;

export const EditorToolbarTitle = styled.div`
  font-size: 1.15em;
  color: #333;
  margin-left: 0.5em;
`;

export const EditorToolbarSpacer = styled.div`
  flex: 1 1 0px;
`;
