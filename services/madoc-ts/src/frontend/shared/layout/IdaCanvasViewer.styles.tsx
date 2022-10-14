import styled, { css } from 'styled-components';

export const OuterLayoutContainer = styled.div`
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
    background: rgba(8, 128, 174, 0.14);
  }

  background-color: white;
  border: 1px solid #002d4b;
  color: #002d4b;
  padding: 0.5em 1em;
  margin: 0.25em;
  display: flex;
  width: auto;
  height: 2.5em;
  cursor: pointer;
  position: relative;

  svg {
    fill: #0880ae;
    width: 1.4em;
    height: 1.4em;
    margin-right: 0.5em;
  }

  ${props =>
    props.$active &&
    css`
      border: 2px solid #002d4b;
      font-weight: 500;
      svg {
        fill: #002d4b;
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
  color: #002d4b;
`;

export const LayoutContent = styled.div<{ $padding?: boolean }>`
  background: #fff;
  border: 2px solid #002d4b;
  flex: 1 1 0px;
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
  display: flex;
  width: 100%;
  background: #ffffff;
`;

export const LayoutSidebar = styled.div<{ $noScroll?: boolean }>`
  background: #ffffff;
  border: 1px solid #002d4b;
  margin-right: 1em;
  overflow: scroll;
  position: relative;
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
