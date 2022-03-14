import React from 'react';
import { SelectorComponent } from '../../../types/selector-types';
import { useCroppedRegion } from '../../content-types/Atlas/Atlas.helpers';
import { BoxSelectorProps } from './BoxSelector';
import { DrawBox, RegionHighlight } from '@atlas-viewer/atlas';
import { useBoxSelector } from './BoxSelector.helpers';

const BoxSelectorAtlas: SelectorComponent<BoxSelectorProps> = props => {
  const { state, hidden, readOnly, id } = props;
  const generatePreview = useCroppedRegion();
  const { onSave, isHighlighted, backgroundColor, border, onClick } = useBoxSelector(props, { generatePreview });

  if (hidden && !isHighlighted) {
    return null;
  }

  if (!state) {
    if (readOnly) {
      return null;
    }

    return <DrawBox onCreate={onSave} />;
  }

  return (
    <RegionHighlight
      key={id}
      region={state as any}
      isEditing={!readOnly}
      background={backgroundColor}
      border={border}
      onSave={onSave}
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
