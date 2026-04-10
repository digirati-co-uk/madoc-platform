import React from 'react';
import { RegionHighlight } from '../../../../atlas/RegionHighlight';
import { SelectorComponent } from '../../../types/selector-types';
import { useCroppedRegion } from '../../content-types/Atlas/Atlas.helpers';
import { BoxSelectorProps } from './BoxSelector';
import { useBoxSelector } from './BoxSelector.helpers';
import { CreateCustomBox } from './components/CreateCustomBox';

const BoxSelectorAtlas: SelectorComponent<BoxSelectorProps> = props => {
  const { state, hidden, readOnly, id } = props;
  const generatePreview = useCroppedRegion();
  const { onSave, style, onClick, onHover } = useBoxSelector(props, { generatePreview });

  if (!readOnly) {
    return <CreateCustomBox box={state || null} onSave={onSave} />;
  }
  if (!state) {
    return null;
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
