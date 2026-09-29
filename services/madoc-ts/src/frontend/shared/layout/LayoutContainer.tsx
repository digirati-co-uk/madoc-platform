import styled, { css } from 'styled-components';
import React from 'react';

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

export function NavIconContainer({
  $active,
  $disabled,
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { $active?: boolean; $disabled?: boolean }) {
  return (
    <div
      className={`relative m-[0.25em] flex h-[2.5em] w-[2.5em] cursor-pointer rounded-[3px] p-[0.5em] data-[has-label=true]:w-auto [&_svg]:h-[1.4em] [&_svg]:w-[1.4em] [&_svg]:fill-current data-[has-label=true]:[&_svg]:mr-[0.3em] ${
        $disabled
          ? 'cursor-not-allowed text-[#ccc]'
          : $active
            ? 'bg-[var(--madoc-accent,#4265e9)] text-[var(--madoc-accent-text,#fff)]'
            : 'text-[#666] hover:bg-[#eee] hover:text-[var(--madoc-accent-link,#4265e9)]'
      } ${className}`}
      {...props}
    />
  );
}

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

export function LayoutContent({
  $padding,
  $btnColor,
  className = '',
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { $padding?: boolean; $btnColor?: string; 'data-vertical-btn'?: boolean }) {
  return (
    <div
      className={`madoc-layout-content flex min-w-0 flex-1 flex-col overflow-y-auto bg-white ${
        $padding ? 'p-[0.5em]' : ''
      } ${className}`}
      style={{ ...style, '--madoc-viewer-button-background': $btnColor || '#fff' } as React.CSSProperties}
      {...props}
    />
  );
}

export const LayoutSidebarMenu = styled.div`
  background: #ffffff;
`;

export const LayoutSidebar = styled.div<{ $noScroll?: boolean }>`
  background: #ffffff;
  border-right: 1px solid #918f8f;
  overflow: auto;
  position: relative;
  display: flex;
  flex-direction: column;

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
  user-select: none;
  cursor: col-resize;
  display: flex;
  align-items: center;
  min-height: 48px;

  svg {
    fill: #a1a1a1;
    left: 2px;
    top: 8px;
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
