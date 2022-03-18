import React from 'react';
import { registerSelector } from '../../../plugin-api/global-store';
import { SelectorSpecification } from '../../../types/selector-types';
import { BoxSelector, BoxSelectorProps } from './BoxSelector';
import BoxSelectorAtlas from './BoxSelector.atlas';

declare module '../../../types/selector-types' {
  export interface SelectorTypeMap {
    'box-selector': BoxSelectorProps;
  }
}

const specification: SelectorSpecification<BoxSelectorProps, 'atlas'> = {
  label: 'Box Selector',
  type: 'box-selector',
  description: 'Supports selecting a region of a IIIF image.',
  FormComponent: BoxSelector,
  defaultState: null,
  supportedContentTypes: ['atlas'],
  contentComponents: {
    atlas: BoxSelectorAtlas,
  },
};

registerSelector(specification);

export default specification;
