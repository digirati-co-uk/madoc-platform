import styled, { css } from 'styled-components';
import {BtnColor, buttonColor} from "../variables";

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

export const NavIconContainer = styled.div<{ $active?: boolean; $disabled?: boolean }>`
  &:hover {
    background: #eee;
  }
  border-radius: 3px;
  padding: 0.5em;
  margin: 0.25em;
  width: 2.5em;
  height: 2.5em;
  cursor: pointer;
  position: relative;

  svg {
    fill: #666;
    width: 1.4em;
    height: 1.4em;
  }

  ${props =>
    props.$active &&
    css`
      background: ${buttonColor};
      svg {
        fill: #fff;
      }
      &:hover {
        background-color: ${buttonColor};
        filter: brightness(90%);
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

export const LayoutContent = styled.div<{ $padding?: boolean }>`
  background: #fff;
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
  background: #ffffff;
  border-right: 1px solid #bcbcbc;
`;

export const LayoutSidebar = styled.div<{ $noScroll?: boolean }>`
  background: #ffffff;
  border-right: 1px solid #bcbcbc;
  overflow: auto;
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
