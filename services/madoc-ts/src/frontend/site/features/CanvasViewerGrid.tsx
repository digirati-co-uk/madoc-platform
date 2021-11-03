import styled from 'styled-components';
import { ButtonRow } from '../../shared/navigation/Button';

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
  top: 0;
  left: 1em;
  z-index: 20;
`;

export const CanvasViewerEditorStyleReset = styled.div`
  font-size: 13px;
  padding: 0 1em;
  min-height: 0;
  overflow-y: auto;
`;