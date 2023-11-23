import useDropdownMenu from 'react-accessible-dropdown-menu-hook';
import styled from 'styled-components';
import { Button, ButtonRow } from '../navigation/Button';

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

export const CanvasViewerControls = styled(ButtonRow)`
  position: absolute;
  right: 1em;
  top: 0;
  z-index: 10;
  &[data-position='left'] {
    left: 1em;
    right: auto;
  }
`;

export const CanvasViewerButton = styled(Button)`
  border-radius: 3px;
  padding: 0.65em;
  font-size: 1em;
  border: none;
  background: #fff;
  display: flex;
  color: #477af1;

  &:focus {
    outline: 2px solid orange;
  }

  &[data-active='true'] {
    background: #477af1;
    color: #fff;
  }
  &[data-active='true']:disabled {
    opacity: 1;
  }

  svg {
    font-size: 1.3em;
  }
`;

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
