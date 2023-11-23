import { registerSelector } from '../../../plugin-api/global-store';
import { SelectorSpecification } from '../../../types/selector-types';
import { PolygonSelector, PolygonSelectorProps } from './PolygonSelector';
import { PolygonSelectorAtlas } from './PolygonSelector.atlas';
import './PolygonSelector.styles.css';

declare module '../../../types/selector-types' {
  export interface SelectorTypeMap {
    'polygon-selector': PolygonSelectorProps;
  }
}

const specification: SelectorSpecification<PolygonSelectorProps, 'atlas'> = {
  label: 'Polygon Selector',
  type: 'polygon-selector',
  description: 'Supports selecting a region of a IIIF image.',
  FormComponent: PolygonSelector,
  defaultState: null,
  supportedContentTypes: ['atlas'],
  contentComponents: {
    atlas: PolygonSelectorAtlas,
  },
};

registerSelector(specification);

export default specification;
