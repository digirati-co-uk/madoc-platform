import copy from 'fast-copy';
import { pluginStore } from '../plugin-api/globals';
import { CaptureModel } from '../types/capture-model';
import { BaseField } from '../types/field-types';
import { isEntity } from './is-entity';
import { generateId } from './generate-id';

export function formPropertyValue<T extends BaseField | CaptureModel['document']>(
  field: T,
  {
    generateNewId = true,
    authors,
    revision,
    clone = true,
    forkValue = false,
    revisesFork = true,
  }: {
    generateNewId?: boolean;
    clone?: boolean;
    authors?: string[];
    forkValue?: boolean;
    revision?: string;
    revisesFork?: boolean;
  } = {}
): T {
  // Copy whole field.
  const id = field.id;
  const newField = clone ? copy(field) : field;

  // Check if we need a new value.
  if (!forkValue && !isEntity(field) && !isEntity(newField)) {
    const description = pluginStore.fields[field.type];
    if (description) {
      (newField as BaseField).value = description.defaultValue;
    }
  }

  // Create revision
  if (revision) {
    newField.revision = revision;
  } else if (newField.revision) {
    delete newField.revision;
  }
  // Create revises.
  if (revisesFork) {
    newField.revises = id;
  } else if (newField.revises) {
    delete newField.revises;
  }
  // Create authors.
  if (newField.authors) {
    if (authors) {
      newField.authors = authors;
    } else {
      delete newField.authors;
    }
  }

  if (generateNewId) {
    // Finally, set a new ID.
    newField.id = generateId();

    // Update selector.
    if (newField.selector) {
      if (newField.selector.revisedBy) {
        // Selector has changed, can unwrap.
        const foundRevision = newField.selector.revisedBy.find(r => r.revisionId === revision);
        if (foundRevision) {
          newField.selector.id = foundRevision.id;
          newField.selector.state = foundRevision.state;
          delete newField.selector.revisedBy;
        } else {
          newField.selector.id = generateId();
        }
      } else {
        // Selector has not yet changed.
        newField.selector.id = generateId();
      }

      if (!forkValue) {
        newField.selector.state = null;
      }
    }
  }

  return newField;
}
