import React from 'react';
import type { CastANetStructure, NetConfig, TabularCellRef } from './types';
import { CastANetCanvas } from './CastANetCanvas';

type CastANetProps = {
  manifestId: string;
  canvasId?: string;
  value: NetConfig;
  onChange: (next: NetConfig) => void;
  onStructureChange?: (next: CastANetStructure) => void;
  blankColumnIndexes?: number[];
  disabled?: boolean;
  dimOpacity?: number;
  onChangeDimOpacity?: (next: number) => void;
  activeCell?: TabularCellRef | null;
};

export const CastANet: React.FC<CastANetProps> = props => {
  return <CastANetCanvas {...props} />;
};

export { CastANetCanvas } from './CastANetCanvas';
export { TabularHeadingsTable } from './TabularHeadingsTable';
export { CastANetOverlayAtlas } from './CastANetOverlayAtlas';
export { buildCastANetStructure, buildTabularProjectSetupPayload } from './CastANetStructure';
