import React from 'react';
import { BaseField, CaptureModel } from '@capture-models/types';

export function hasMatchingProfile<
  Type,
  Key extends keyof Components,
  Components extends { [text: string]: React.FC<any> | undefined },
  Mapping extends { [key: string]: Components }
>(
  entityOrField: BaseField | CaptureModel['document'] | undefined,
  map: Mapping,
  component: Key
): Components[Key] | undefined {
  if (!entityOrField) {
    return undefined;
  }

  if (!entityOrField.profile) {
    return undefined;
  }

  if (!map[entityOrField.profile]) {
    return undefined;
  }

  return map[entityOrField.profile][component];
}
