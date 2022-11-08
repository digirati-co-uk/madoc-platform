import styled, { css } from 'styled-components';

export const OuterLayoutContainer = styled.div`
  width: 100%;
  max-width: 100%;
  background: #ffffff;
  height: 100%;
  max-height: 100%;
  overflow: auto;
`;
export const FlexLayoutContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 100%;
  flex-direction: row;
  background: #ffffff;
  height: 100%;
  overflow: hidden;
  max-height: 100%;
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
`;

export const NavIconContainer = styled.div<{ $active?: boolean; $disabled?: boolean }>`
  &:hover {
    background: #eee;
  }
  border-radius: 3px;
  padding: 0.5em;
  margin: 0.25em;
  color: #333;
  width: auto;
  display: flex;
  height: 2.5em;
  cursor: pointer;
  position: relative;

  svg {
    fill: #666;
    width: 1.4em;
    height: 1.4em;
    margin-right: 0.3em;
  }

  ${props =>
    props.$active &&
    css`
      background: #4a64e1;
      color: #fff;

      svg {
        fill: #fff;
      }
      &:hover {
        background: #4a64e1;
      }
    `}

  ${props =>
    props.$disabled &&
    css`
      background: transparent;
      cursor: not-allowed;
      svg {
        fill: #ccc;
      }
      &:hover {
        background: transparent;
      }
    `}
`;

export const NavIconNotifcation = styled.div`
  background: #dd3c3c;
  padding: 0.3em;
  position: absolute;
  top: -0.6em;
  border-radius: 5px;
  font-size: 0.7em;
  right: -0.6em;
  min-width: 1.4em;
  text-align: center;
  color: #fff;
`;

export const LayoutContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 100%;
  min-width: 0;
`;

export const PanelTitle = styled.h5`
  text-transform: capitalize;
  font-size: 20px;
  margin: 10px 0;
`;

export const LayoutContent = styled.div<{ $padding?: boolean }>`
  background: #fff;
  flex: 1 1 0;
  min-width: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  ${props =>
    props.$padding &&
    css`
      padding: 0.5em;
    `}
`;

export const LayoutSidebarMenu = styled.div`
  background: #ffffff;
`;

export const LayoutSidebar = styled.div<{ $noScroll?: boolean }>`
  background: #ffffff;
  border-right: 1px solid #918f8f;
  overflow: auto;
  position: relative;
  margin-right: 1em;
  ${props =>
    props.$noScroll &&
    css`
      overflow: hidden;
      max-height: 100%;
    `}
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
