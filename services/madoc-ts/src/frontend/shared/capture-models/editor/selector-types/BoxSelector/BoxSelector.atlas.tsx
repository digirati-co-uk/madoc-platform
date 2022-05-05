import React, { useCallback } from 'react';
import { SelectorComponent } from '../../../types/selector-types';
import { useCroppedRegion } from '../../content-types/Atlas/Atlas.helpers';
import { BoxSelectorProps } from './BoxSelector';
import { BoxStyle, DrawBox, ResizeWorldItem } from '@atlas-viewer/atlas';
import { useBoxSelector } from './BoxSelector.helpers';

type RegionHighlightType = {
  id: any;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const RegionHighlight: React.FC<{
  id?: string;
  region: RegionHighlightType;
  isEditing: boolean;
  onSave: (annotation: RegionHighlightType) => void;
  onClick: (annotation: RegionHighlightType) => void;
  interactive?: boolean;
  style?: BoxStyle;
}> = ({ id, interactive, region, onClick, onSave, isEditing, style = { backgroundColor: 'rgba(0,0,0,.5)' } }) => {
  const saveCallback = useCallback(
    bounds => {
      onSave({ id: region.id, x: region.x, y: region.y, height: region.height, width: region.width, ...bounds });
    },
    [onSave, region.id, region.x, region.y, region.height, region.width]
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
    >
      <box
        html
        id={`${id}/box`}
        relativeStyle
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
};

const BoxSelectorAtlas: SelectorComponent<BoxSelectorProps> = props => {
  const { state, hidden, readOnly, id } = props;
  const generatePreview = useCroppedRegion();
  const { onSave, style, onClick } = useBoxSelector(props, { generatePreview });

  // if (hidden && !isHighlighted) {
  //   return null;
  // }

  if (!state) {
    if (readOnly) {
      return null;
    }

    return <DrawBox onCreate={onSave} />;
  }

  return (
    <RegionHighlight
      key={id}
      id={id}
      region={state as any}
      isEditing={!readOnly}
      onSave={onSave}
      interactive={!hidden}
      style={style}
      onClick={e => {
        if (props.onClick) {
          props.onClick(props);
        }
        onClick(e);
      }}
    />
  );
};

export default BoxSelectorAtlas;
