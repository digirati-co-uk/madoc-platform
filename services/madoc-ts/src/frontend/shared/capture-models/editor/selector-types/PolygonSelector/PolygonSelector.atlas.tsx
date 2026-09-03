import { InputShape } from 'polygon-editor';
import { useAnnotationStyles } from '../../../AnnotationStyleContext';
import { BaseSelector, SelectorTypeProps } from '../../../types/selector-types';
import { useImageServiceContext } from '../../content-types/Atlas/Atlas.helpers';
import { useSelectorEvents } from '../../stores/selectors/selector-helper';
import { CreateCustomShape } from './components/CreateCustomShape';

export interface PolygonSelectorProps extends BaseSelector {
  id: string;
  type: 'polygon-selector';
  hidden?: boolean;
  state: null | {
    type: 'polygon' | 'polyline' | 'line';
    shape: InputShape;
    svgPreview?: string;
  };
}

export function PolygonSelectorAtlas(props: SelectorTypeProps<PolygonSelectorProps>) {
  const image = useImageServiceContext();
  const { readOnly, id, bucket } = props;
  const { onClick, isHighlighted } = useSelectorEvents(props.id);
  const styles = useAnnotationStyles();
  const style =
    isHighlighted && bucket === 'currentLevel' ? styles.highlighted : styles[bucket || 'hidden'] || styles.hidden;

  const updateShape = (shape: InputShape) => {
    if (props.updateSelector) {
      props.updateSelector({
        type: 'polygon',
        shape,
      });
    }
  };

  if (readOnly) {
    const Shape = 'shape' as any;
    const shape = props.state?.shape;
    if (!shape) {
      return null;
    }
    return (
      <Shape
        id={`shape-${id}`}
        points={shape.points}
        open={shape.open}
        onClick={onClick}
        relativeStyle={true}
        target={{ x: 0, y: 0, width: image.width, height: image.height }}
        style={style}
      />
    );
  }

  return (
    <CreateCustomShape
      image={image}
      shape={props.state?.shape || { id: props.id, open: true, points: [] }}
      updateShape={updateShape}
    />
  );
}
