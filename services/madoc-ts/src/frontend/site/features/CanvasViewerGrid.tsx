import styled from 'styled-components';
import { Button, ButtonRow } from '../../shared/navigation/Button';

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
  max-height: 100%;
  display: flex;
  flex-direction: column;
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
`;

export const CanvasViewerButton = styled(Button)`
  border-radius: 3px;
  padding: 0.8em;
  font-size: 1em;
  border: none;
  background: #fff;
  display: flex;
  color: #477af1;

  &:focus {
    outline: 2px solid orange;
  }
`;

export const CanvasViewerEditorStyleReset = styled.div`
  font-size: 13px;
  padding: 0 1em;
  min-height: 0;
  overflow-y: auto;
`;
