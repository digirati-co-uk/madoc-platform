import useDropdownMenu from 'react-accessible-dropdown-menu-hook';
import styled from 'styled-components';
import React from 'react';
import { CanvasViewerButton } from './CanvasViewerButton';

export { CanvasViewerButton } from './CanvasViewerButton';

export const CanvasViewerGrid = styled.div<{ $vertical?: boolean }>`
  display: flex;
  flex-direction: ${props => (props.$vertical ? 'column' : 'row')};
  width: 100%;
  max-height: 100%;
  height: 100%;
`;

export const CanvasViewerGridContent = styled.div<{ $vertical?: boolean }>`
  width: ${props => (props.$vertical ? '100%' : 'auto')};
  flex: 1 1 0px;
  height: 100%;
  min-width: 0;
  position: relative;
`;

export const CanvasViewerGridSidebar = styled.div<{ $vertical?: boolean }>`
  width: ${props => (props.$vertical ? '100%' : '420px')};
  max-height: 80vh;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

export const CanvasViewerEditorStyleReset = styled.div`
  font-size: 13px;
  padding: 0 1em;
  overflow-y: scroll;
  max-height: 60vh;
`;

export const ContributionSaveButton = styled.div`
  background: white;
  position: sticky;
  bottom: 0;
  z-index: 9;
  border-top: 1px solid rgb(197, 190, 190);
`;
export const CanvasViewerContentOverlay = styled.div`
  position: absolute;
  bottom: 50%;
  z-index: 20;
  text-align: center;
  left: 0;
  right: 0;
  pointer-events: none;
`;

export function CanvasViewerControls({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { 'data-position'?: 'left' }) {
  return (
    <div
      className={`madoc-canvas-viewer-controls absolute right-2 top-0 z-10 m-0 flex items-start gap-[0.5em] data-[position=left]:left-2 data-[position=left]:right-auto ${className}`}
      {...props}
    />
  );
}

const CanvasViewerButtonOuterContainer = styled.div`
  position: relative;
`;

const CanvasViewerButtonMenuContainer = styled.div`
  position: absolute;
  top: 3.2em;
  left: 0;
  z-index: 100;
  display: flex;
  gap: 0.5em;
`;

export function CanvasViewerButtonMenu(props: {
  label: string;
  children: any;
  disabled?: boolean;
  items: Array<{
    label: string;
    icon: any;
    onClick: () => void;
    disabled?: boolean;
    selected?: boolean;
  }>;
}) {
  const { isOpen, buttonProps, itemProps } = useDropdownMenu(props.items.length + 1);

  const selected = props.items.find(item => item.selected);

  return (
    <CanvasViewerButtonOuterContainer>
      <CanvasViewerButton
        title={props.label}
        data-active={!!selected || isOpen}
        {...buttonProps}
        disabled={props.disabled}
      >
        {selected ? selected.icon : props.children}
      </CanvasViewerButton>
      <CanvasViewerButtonMenuContainer>
        {isOpen
          ? props.items.map((item, index) => (
              <CanvasViewerButton
                key={`item-${index}`}
                {...(itemProps[index] as any)}
                disabled={item.disabled}
                title={item.label}
                onClick={item.onClick}
                data-active={item.selected}
              >
                {item.icon}
              </CanvasViewerButton>
            ))
          : null}
      </CanvasViewerButtonMenuContainer>
    </CanvasViewerButtonOuterContainer>
  );
}
