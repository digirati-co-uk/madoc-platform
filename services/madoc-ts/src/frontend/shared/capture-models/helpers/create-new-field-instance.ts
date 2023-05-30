import copy from 'fast-copy';
import { pluginStore } from '../plugin-api/globals';
import { CaptureModel } from '../types/capture-model';
import { BaseField } from '../types/field-types';
import { generateId } from './generate-id';

export function createNewFieldInstance(
  entity: CaptureModel['document'],
  property: string,
  multipleOverride = false,
  revisionId?: string | null
): BaseField {
  // Grab the property itself from the entity.
  const prop = entity.properties[property];
  if (!prop || prop.length <= 0) {
    throw new Error('invalid property');
  }

  // Grab the template value (first) and ensure it allows multiple instances
  const template = prop[0];
  if (!template.allowMultiple && !multipleOverride) {
    throw new Error('field does not support multiple values.');
  }

  // Clone the template field.
  const newField = copy<BaseField>(template as BaseField);
  const description = pluginStore.fields[newField.type];
  // if (!description) {
  //   throw new Error(`field plugin not found of type ${newField.type}`);
  // }

  // Modify the new field with defaults form the plugin store
  newField.id = generateId();
  newField.value = copy(description ? description.defaultValue : null);
  if (newField.selector) {
    newField.selector.id = generateId();
    newField.selector.state = null;
    if (newField.selector.revisedBy) {
      delete newField.selector.revisedBy;
    }
  }
  if (newField.revises) {
    newField.revises = undefined;
  }
  if (revisionId) {
    newField.revision = revisionId;
  }

  return newField;
}
