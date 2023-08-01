import React from 'react';
import { registerField } from '../../../frontend/shared/capture-models/plugin-api/global-store';
import { FieldSpecification } from '../../../frontend/shared/capture-models/types/field-types';
import { AvatarGenerator, AvatarGeneratorFieldProps } from './AvatarGeneratorField';
import { AvatarGeneratorFieldPreview } from './AvatarGeneratorField.preview';

declare module '../../../frontend/shared/capture-models/types/field-types' {
  export interface FieldTypeMap {
    'avatar-generator-field': AvatarGeneratorFieldProps;
  }
}

export const specification: FieldSpecification<AvatarGeneratorFieldProps> = {
  defaultValue: null,
  type: 'avatar-generator-field' as const,
  label: 'Avatar Generator Field',
  defaultProps: {},
  allowMultiple: true,
  required: false,
  TextPreview: AvatarGeneratorFieldPreview,
  description: 'Click to generate and enable an avatar on for profile',
  Component: AvatarGenerator,
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './AvatarGeneratorField.editor')),
};

registerField(specification);

export default specification;
