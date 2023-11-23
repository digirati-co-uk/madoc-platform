import { InputShape } from 'polygon-editor';
import { ViewSelector } from '../../../_components/ViewDocument/components/ViewSelector';
import { BaseSelector } from '../../../types/selector-types';

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

export function PolygonSelector(props: PolygonSelectorProps) {
  return (
    <div>
      {props.state && props.state.shape && !props.state.shape.open && props.state.shape.points.length > 1 ? (
        <ViewSelector
          fluidImage
          selector={{
            id: 'test',
            type: 'polygon-selector',
            state: props.state,
          }}
        />
      ) : (
        <>Draw a shape</>
      )}
    </div>
  );
}
