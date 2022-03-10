import React, { useEffect, useState } from 'react';
import { SelectorComponent } from '../../../types/selector-types';
import { BoxSelectorProps } from './BoxSelector';
import { EditableAnnotation } from 'canvas-panel-beta';
import { useViewer } from '../../content-types/CanvasPanel/CanvasPanel';
import { useBoxSelector } from './BoxSelector.helpers';

const BoxSelectorCanvasPanel: SelectorComponent<BoxSelectorProps> = props => {
  const { isHighlighted, backgroundColor, border } = useBoxSelector(props);
  const [selector, setSelector] = useState<BoxSelectorProps['state']>(props.state);
  const viewer = useViewer();

  useEffect(() => {
    if (viewer && props.state && props.isTopLevel) {
      const t = setTimeout(() => {
        viewer.goToRect(props.state, 50);
      }, 100);
      return () => {
        clearTimeout(t);
        viewer.resetView();
      };
    }
    return () => {};
  }, [props.isTopLevel, props.state, viewer]);

  if (!props.state || (props.hidden && !isHighlighted)) return null;

  if (props.readOnly) {
    return (
      <EditableAnnotation
        {...props}
        {...props.state}
        ratio={1}
        boxStyles={{
          pointerEvents: 'none',
          background: backgroundColor,
          outline: border,
        }}
      />
    );
  }

  return (
    <EditableAnnotation
      {...props}
      {...props.state}
      ratio={1}
      setCoords={(coords: any) => {
        setSelector({ ...selector, ...coords });
        if (props.updateSelector) {
          props.updateSelector({ ...selector, ...coords });
        }
      }}
      style={{ background: backgroundColor, border }}
    />
  );
};

export default BoxSelectorCanvasPanel;
