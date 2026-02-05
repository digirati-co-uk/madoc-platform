import React from 'react';
import type { NetConfig } from './types';
import { CastANetCanvas } from './CastANetCanvas';

type CastANetProps = {
  manifestId: string;
  canvasId?: string;
  value: NetConfig;
  onChange: (next: NetConfig) => void;
  disabled?: boolean;
};

export const CastANet: React.FC<CastANetProps> = props => {
  return <CastANetCanvas {...props} />;
};

export { CastANetCanvas } from './CastANetCanvas';
export { TabularHeadingsTable } from './TabularHeadingsTable';
export { CastANetOverlayAtlas } from './CastANetOverlayAtlas';
