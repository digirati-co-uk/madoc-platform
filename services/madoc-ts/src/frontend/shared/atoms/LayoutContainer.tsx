import styled, { css } from 'styled-components';

export const OuterLayoutContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 100%;
  flex-direction: row;
  background: #ffffff;
  //border: 1px solid #bcbcbc;
  //box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.17);
  height: 100%;
  overflow: hidden;
  max-height: 100%;
  flex: 1 1 0px;
  min-height: 0;
  min-width: 0;
`;

export const NavIconContainer = styled.div<{ $active?: boolean }>`
  &:hover {
    background: #eee;
  }
  border-radius: 3px;
  padding: 0.5em;
  margin: 0.25em;
  width: 2.5em;
  height: 2.5em;
  cursor: pointer;

  svg {
    fill: #666;
    width: 1.4em;
    height: 1.4em;
  }

  ${props =>
    props.$active &&
    css`
      background: #4a64e1;
      svg {
        fill: #fff;
      }
      &:hover {
        background: #4a64e1;
      }
    `}
`;

export const LayoutContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 100%;
`;

export const LayoutContent = styled.div<{ $padding?: boolean }>`
  background: #fff;
  flex: 1 1 0px;
  min-width: 0;
  overflow-y: auto;
  ${props =>
    props.$padding &&
    css`
      padding: 0.5em;
    `}
`;

export const LayoutSidebarMenu = styled.div`
  background: #ffffff;
  border-right: 1px solid #bcbcbc;
`;

export const LayoutSidebar = styled.div`
  background: #ffffff;
  border-right: 1px solid #bcbcbc;
  overflow: auto;
  position: relative;
`;

export const LayoutHandle = styled.div<{ $isDragging?: boolean }>`
  width: 6px;
  background: #eee;
  height: 100%;
  user-select: none;
  cursor: col-resize;
  &:hover,
  &:active {
    background: #ddd;
  }

  ${props =>
    props.$isDragging &&
    css`
      &,
      &:active,
      &:hover {
        background-color: blue;
      }
    `}
`;
