import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { RegionHighlight } from '../../../../atlas/RegionHighlight';
import { ResizeWorldItem } from '../../../../atlas/ResizeWorldItem';
import { SelectorComponent } from '../../../types/selector-types';
import { useCroppedRegion } from '../../content-types/Atlas/Atlas.helpers';
import { BoxSelectorProps } from './BoxSelector';
import { BoxStyle, DrawBox } from '@atlas-viewer/atlas';
import { useBoxSelector } from './BoxSelector.helpers';

type RegionHighlightType = {
  id: any;
  x: number;
  y: number;
  width: number;
  height: number;
};

export const RegionHighlight2: React.FC<{
  id?: string;
  region: RegionHighlightType;
  isEditing: boolean;
  onSave: (annotation: RegionHighlightType) => void;
  onClick: (annotation: RegionHighlightType) => void;
  interactive?: boolean;
  style?: BoxStyle;
}> = ({ id, interactive, region, onClick, onSave, isEditing, style = { backgroundColor: 'rgba(0,0,0,.5)' } }) => {
  const saveCallback = useCallback(
    (bounds: any) => {
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
  const [mounted, setMounted] = useState(false);
  const { onSave, style, onClick, onHover } = useBoxSelector(props, { generatePreview });

  useEffect(() => {
    if (!state) {
      const timeout = setTimeout(() => {
        setMounted(true);
      }, 500);

      return () => {
        clearTimeout(timeout);
        setMounted(false);
      };
    }
  }, [state]);

  if (!state) {
    if (!mounted) {
      return null;
    }
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
      onHover={e => {
        if (props.onHover) {
          props.onHover(props);
        }
        onHover(e);
      }}
    />
  );
};

export default BoxSelectorAtlas;
