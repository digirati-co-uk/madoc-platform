import { BoxStyle } from '@atlas-viewer/atlas';
import React, { useCallback } from 'react';
import { ResizeWorldItem } from './ResizeWorldItem';

type RegionHighlightType = {
  id: any;
  x: number;
  y: number;
  width: number;
  height: number;
};

export function RegionHighlight({
  id,
  interactive,
  region,
  onClick,
  onSave,
  maintainAspectRatio,
  disableCardinalControls,
  isEditing,
  style = { backgroundColor: 'rgba(0,0,0,.5)' },
}: {
  id?: string;
  region: RegionHighlightType;
  isEditing: boolean;
  onSave: (annotation: RegionHighlightType) => void;
  onClick: (annotation: RegionHighlightType) => void;
  maintainAspectRatio?: boolean;
  disableCardinalControls?: boolean;
  interactive?: boolean;
  style?: BoxStyle;
}) {
  const saveCallback = useCallback(
    (bounds: any) => {
      console.trace();
      if (isEditing) {
        onSave({ id: region.id, x: region.x, y: region.y, height: region.height, width: region.width, ...bounds });
      }
    },
    [onSave, isEditing, region.id, region.x, region.y, region.height, region.width]
  );

  return (
    <ResizeWorldItem
      id={id}
      x={region.x}
      y={region.y}
      width={region.width}
      height={region.height}
      resizable={isEditing}
      onSave={saveCallback}
      maintainAspectRatio={maintainAspectRatio}
      disableCardinalControls={disableCardinalControls}
    >
      <box
        interactive={interactive}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          onClick(region);
        }}
        target={{ x: 0, y: 0, width: region.width, height: region.height }}
        style={style}
      />
    </ResizeWorldItem>
  );
}
