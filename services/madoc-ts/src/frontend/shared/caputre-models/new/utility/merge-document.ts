import { traverseDocument } from '@capture-models/helpers';
import { BaseField, CaptureModel } from '@capture-models/types';

export function mergeDocument(
  oldDoc: CaptureModel['document'],
  newDocument: CaptureModel['document'],
  deletions: string[] = [],
  revisionId?: string
): CaptureModel['document'] {
  const errors: Array<{ message: string; property?: string }> = [];
  const entityMap: { [key: string]: CaptureModel['document'] } = {};
  const fieldMap: { [key: string]: BaseField } = {};

  console.log(deletions);

  // Traverse original document and make map of fields/entities.
  traverseDocument(oldDoc, {
    visitEntity(entity, property, parent) {
      if (deletions.indexOf(entity.id) !== -1) {
        // Delete the property
        console.log('deleting', entity.id);
        if (parent && property && parent.properties[property]) {
          parent.properties[property] = (parent.properties[property] as any[]).filter(en => en.id !== entity.id);
        }
      } else {
        entityMap[entity.id] = entity;
      }
    },
    visitField(field, property, parent) {
      if (deletions.indexOf(field.id) !== -1) {
        // Delete the property
        console.log('deleting', field.id);
        if (parent && property && parent.properties[property]) {
          parent.properties[property] = (parent.properties[property] as any[]).filter(en => en.id !== field.id);
        }
      } else {
        fieldMap[field.id] = field;
      }
    },
  });

  traverseDocument(newDocument, {
    visitEntity(entity, property, parent) {
      const originalEntity = entityMap[entity.id];
      if (deletions.indexOf(entity.id) !== -1) {
        return; // skip if deleted.
      }
      if (originalEntity) {
        if (entity.selector?.revisionId === revisionId) {
          delete entity.selector?.revisionId;
        }
        // Override selector.
        originalEntity.selector = entity.selector;
      } else {
        if (parent) {
          if (entity?.revision === revisionId) {
            delete entity?.revision;
          }
          // Create new.
          const originalParent = entityMap[parent.id];
          if (originalParent) {
            if (property) {
              // Add it to the parent property.
              originalParent.properties[property] = originalParent.properties[property]
                ? originalParent.properties[property]
                : [];
              originalParent.properties[property].push(entity as any);
            } else {
              errors.push({ message: 'Cannot add new entity, no valid property' });
            }
          } else {
            // This must be nested further down, can be ignored.
          }
        } else {
          // Invalid document.
          errors.push({ message: 'Cannot add document without parent', property });
        }
      }
    },
    visitField(field, property, parent) {
      const originalField = fieldMap[field.id];
      if (deletions.indexOf(field.id) !== -1) {
        return; // skip if deleted.
      }
      if (originalField) {
        // Modify field.
        originalField.selector = field.selector;
        originalField.value = field.value;
        originalField.sortOrder = field.sortOrder;
      } else {
        if (parent) {
          if (field?.revision === revisionId) {
            delete field?.revision;
          }
          // Create new field.
          const originalParent = entityMap[parent.id];
          if (originalParent) {
            if (property) {
              originalParent.properties[property] = originalParent.properties[property]
                ? originalParent.properties[property]
                : [];
              originalParent.properties[property].push(field as any);
            } else {
              errors.push({ message: 'Cannot add new field, no valid property' });
            }
          } else {
            // Nested further down, can be ignored.
          }
        } else {
          // Invalid field.
          errors.push({ message: 'Cannot add field without parent', property });
        }
      }
    },
  });

  if (errors.length) {
    throw new Error(`
  ${errors.map(error => {
    return `  - ${error.property}: ${error.message}`;
  })}
    `);
  }

  return oldDoc;
}
