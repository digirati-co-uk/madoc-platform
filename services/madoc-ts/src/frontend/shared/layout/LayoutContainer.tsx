import styled, { css } from 'styled-components';
import { CanvasViewerButton, CanvasViewerControls } from '../../site/features/CanvasViewerGrid';

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
    background: #eee;
  }

  border-radius: 3px;
  padding: 0.5em;
  margin: 0.25em;
  color: #333;
  width: 2.5em;
  display: flex;
  height: 2.5em;
  cursor: pointer;
  position: relative;

  svg {
    fill: #666;
    width: 1.4em;
    height: 1.4em;
  }

  &[data-has-label='true'] {
    width: auto;

    svg {
      margin-right: 0.3em;
    }
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

export const LayoutContent = styled.div<{ $padding?: boolean; $btnColor?: string }>`
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
  ${CanvasViewerButton} {
    background-color: ${props => props.$btnColor};
  }

  &[data-vertical-btn='true'] {
    ${CanvasViewerControls} {
      display: flex;
      flex-direction: column;

      button:first-child {
        order: 1;
      }

      button:nth-child(2) {
        order: 2;
      }

      button:nth-child(3) {
        order: 0;
      }

      ${CanvasViewerButton} {
        margin-bottom: 0.5em;
        margin-left: 0;
      }
    }
`;

export const LayoutSidebarMenu = styled.div`
  background: #ffffff;
`;

export const LayoutSidebar = styled.div<{ $noScroll?: boolean }>`
  background: #ffffff;
  border-right: 1px solid #918f8f;
  overflow: auto;
  position: relative;

  &[data-space='true'] {
    margin-right: 1em;
  }

  ${props =>
    props.$noScroll &&
    css`
      overflow: hidden;
      max-height: 100%;
    `}
`;

export const LayoutHandle = styled.div<{ $isDragging?: boolean }>`
  width: 12px;
  background: #ddd;
  height: 100%;
  min-height: 30px;
  user-select: none;
  cursor: col-resize;

  svg {
    fill: #a1a1a1;
  }

  &:hover,
  &:active {
    background: #a1a1a1;

    svg {
      fill: #181818;
    }
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
