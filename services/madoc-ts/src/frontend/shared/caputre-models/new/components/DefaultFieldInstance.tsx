import { FieldInstance } from '@capture-models/editor';
import { BaseField } from '@capture-models/types';
import React from 'react';

export const DefaultFieldInstance: React.FC<{
  field: BaseField;
  property: string;
  path: Array<[string, string]>;
  hideHeader?: boolean;
}> = ({ field, property, path, hideHeader }) => {
  return <FieldInstance field={field} property={property} path={path} hideHeader={hideHeader} />;
};
