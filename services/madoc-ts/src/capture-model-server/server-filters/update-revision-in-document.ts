import copy from 'fast-copy';
import { fixModelBugs } from '../../frontend/shared/capture-models/helpers/capture-model-to-revision-list';
import { isEntity } from '../../frontend/shared/capture-models/helpers/is-entity';
import { traverseDocument } from '../../frontend/shared/capture-models/helpers/traverse-document';
import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { BaseField } from '../../frontend/shared/capture-models/types/field-types';
import { RevisionRequest } from '../../frontend/shared/capture-models/types/revision-request';
import { BaseSelector } from '../../frontend/shared/capture-models/types/selector-types';
import { deleteFrom } from './delete-from';
import { extractValidRevisionChanges } from './extract-valid-revision-changes';

function createValidSelector(
  base: BaseSelector | undefined,
  incoming: BaseSelector,
  experimental: boolean
): BaseSelector | undefined {
  if (!experimental) {
    return incoming;
  }
  if (!base) {
    return undefined;
  }

  const newSelector = copy(base);
  // Copy valid properties.
  newSelector.id = incoming.id;
  delete newSelector.revisedBy;
  if (incoming.revisionId) {
    newSelector.revisionId = incoming.revisionId;
  } else {
    delete newSelector.revisionId;
  }
  if (incoming.revises) {
    newSelector.revises = incoming.revises;
  } else {
    delete newSelector.revises;
  }
  newSelector.state = incoming.state;

  return newSelector;
}

export function createValidField(
  base: BaseField | undefined,
  incoming: BaseField,
  experimental: boolean
): BaseField | undefined {
  if (!experimental) {
    return incoming;
  }
  if (!base) {
    return undefined;
  }

  const newField = copy(base);

  newField.id = incoming.id;
  newField.selector = incoming.selector; // Validation for this should be handled elsewhere.
  newField.value = incoming.value;
  if (incoming.revision) {
    newField.revision = incoming.revision;
  } else {
    delete newField.revision;
  }
  if (incoming.revises) {
    newField.revises = incoming.revises;
  } else {
    delete newField.revises;
  }
  if (incoming.sortOrder) {
    newField.sortOrder = incoming.sortOrder;
  } else {
    delete newField.sortOrder;
  }

  return newField;
}

export function createValidEntity(
  base: CaptureModel['document'] | undefined,
  incoming: CaptureModel['document'],
  experimental: boolean
): CaptureModel['document'] | undefined {
  if (!experimental) {
    return incoming;
  }
  if (!base) {
    return undefined;
  }

  const newEntity = copy(base);

  newEntity.id = incoming.id;
  newEntity.selector = incoming.selector; // Validation for this should be handled elsewhere.
  if (incoming.revision) {
    newEntity.revision = incoming.revision;
  } else {
    delete newEntity.revision;
  }
  if (incoming.revises) {
    newEntity.revises = incoming.revises;
  } else {
    delete newEntity.revises;
  }
  if (incoming.sortOrder) {
    newEntity.sortOrder = incoming.sortOrder;
  } else {
    delete newEntity.sortOrder;
  }

  const validProperties = Object.keys(base.properties);
  newEntity.properties = {};
  for (const validProperty of validProperties) {
    if (incoming.properties[validProperty]) {
      // Validation for this should be handled elsewhere.
      newEntity.properties[validProperty] = incoming.properties[validProperty];
    }
  }

  return newEntity;
}

/**
 * UNUSED.
 */
export function findValidProperty(
  document: CaptureModel['document'] | BaseField,
  path: string[]
): BaseField | CaptureModel['document'] {
  if (path.length < 3 || !isEntity(document)) {
    return document;
  }

  const [properties, prop, index, ...rest] = path;
  if (properties !== 'properties') {
    return document;
  }

  // Except here... instead of 0 we should find the best.
  const found = document.properties[prop][0];

  return findValidProperty(found, rest);
}

export function updateRevisionInDocument(
  captureModel: CaptureModel,
  req: RevisionRequest,
  options: {
    allowAnonymous?: boolean;
    allowCanonicalChanges?: boolean;
    allowCustomStructure?: boolean;
    experimental?: boolean;
  } = {}
) {
  const experimental = options.experimental !== false;
  // Model bugs.
  fixModelBugs(captureModel);

  const { mutations } = extractValidRevisionChanges(captureModel, req, {
    allowAnonymous: options.allowAnonymous,
    allowCustomStructure: options.allowCustomStructure,
    allowCanonicalChanges: false,
  });

  if (Object.keys(mutations).length) {
    // Apply document mutations.
    traverseDocument(captureModel.document, {
      visitSelector(selector) {
        const mutationsToApply = mutations[selector.id];
        if (mutationsToApply && mutationsToApply.length) {
          for (const mutation of mutationsToApply) {
            if (mutation.type === 'deletion') {
              // @todo delete selectors (not currently available in UI)
            }

            if (mutation.type === 'selector') {
              selector.revisedBy = selector.revisedBy ? selector.revisedBy : [];
              const existingSelector = selector.revisedBy.findIndex(s => s.id === mutation.id);
              const newSelector = createValidSelector(selector, mutation.selector, experimental);

              if (!newSelector) continue;
              // This should be the path to take.
              if (existingSelector !== -1) {
                selector.revisedBy[existingSelector] = newSelector;
              } else {
                selector.revisedBy.push(newSelector);
              }
            }
          }
        }
      },

      visitField(field, property, parent) {
        const mutationsToApply = mutations[field.id];
        if (mutationsToApply && mutationsToApply.length) {
          for (const mutation of mutationsToApply) {
            // Deletion of an item that matches the revision.
            if (mutation.type === 'deletion') {
              if (parent && property) {
                deleteFrom(field.id, property, parent);
              }
              continue;
            }
          }
        }
      },

      visitEntity(entity, property, parent) {
        // Is there a change to be applied
        const mutationsToApply = mutations[entity.id];
        if (mutationsToApply && mutationsToApply.length) {
          for (const mutation of mutationsToApply) {
            // Deletion of an item that matches the revision.
            if (mutation.type === 'deletion') {
              if (parent && property) {
                deleteFrom(entity.id, property, parent);
              }
              continue;
            }

            // Selectors on their own.
            if (mutation.type === 'selector') {
              if (entity.selector) {
                entity.selector.revisedBy = entity.selector.revisedBy ? entity.selector.revisedBy : [];
                const existingSelector = entity.selector.revisedBy.findIndex(s => s.id === mutation.id);
                const newSelector = createValidSelector(entity.selector, mutation.selector, experimental);

                if (!newSelector) continue;
                if (existingSelector !== -1) {
                  entity.selector.revisedBy[existingSelector] = newSelector;
                } else {
                  entity.selector.revisedBy.push(newSelector);
                }
              }
              continue;
            }

            if (mutation.type === 'selector-self') {
              const revised = entity.selector?.revisedBy;
              const newSelector = createValidSelector(entity.selector, mutation.selector, experimental);

              // Don't allow updating the revised property directly here. Avoid messing up other peoples revisions.
              if (revised && newSelector) {
                newSelector.revisedBy = revised;
              }

              entity.selector = newSelector;
              continue;
            }

            // Properties.
            const propertyList = entity.properties[mutation.term as any];
            if (!propertyList) {
              // Maybe configuration?
              entity.properties[mutation.term as any] = [];
            }

            const existing = (entity.properties[mutation.term as any] as any[]).findIndex(
              (r: any) => r.id === mutation.id
            );

            let toPush = mutation.type === 'entity' ? mutation.entity : mutation.field;

            // @todo experimental approach
            //   1. If there is an existing entity or field - only apply changes that are allowed
            //   2. If there is a NEW entity or field, first take a clone of an existing, and change permitted fields.

            if (experimental) {
              const existingProperties = entity.properties[mutation.term as any][existing];
              if (mutation.type === 'entity') {
                if (existing !== -1) {
                  const existingEntity: CaptureModel['document'] = (existingProperties as any)[existing as any];
                  const newEntity = createValidEntity(existingEntity, mutation.entity, true);
                  if (newEntity) {
                    toPush = newEntity;
                  } else {
                    // @todo ERROR?
                  }
                } else {
                  // @todo forking a new entity.
                  if (entity.properties[mutation.term as any][0]) {
                    const newEntity = createValidEntity(
                      entity.properties[mutation.term as any][0] as any,
                      mutation.entity,
                      true
                    );
                    if (newEntity) {
                      toPush = newEntity;
                    }
                  }
                }
              }

              if (mutation.type === 'field') {
                if (existing !== -1) {
                  const existingField: BaseField = (existingProperties as any)[existing as any];
                  const newField = createValidField(existingField, mutation.field, true);
                  if (newField) {
                    toPush = newField;
                  } else {
                    // @todo ERROR?
                  }
                } else {
                  // @todo forking a new field
                  //   - PROBLEM -> it might be a new field inside a NEW entity. In this case we just have to allow
                  //     Potentially different data structures.
                  //     Alternatively we could follow the zero path e.g. `root.properties[0].field[0]` and use that as
                  //     the template. However, we would probably need to fine the first CANONICAL each time (no revision).
                }
              }
            }

            if (existing !== -1) {
              // Replace with a null value placeholder (filtered out further down) to preserve the index.
              (entity.properties[mutation.term as any][existing] as any) = null;
            }

            // This performs a shallow merge, since the other properties should already be applied
            // in a previous step.
            if (!experimental && mutation.type === 'entity' && mutation.shallow && existing !== -1) {
              const existingProperties = entity.properties[mutation.term as any][existing];
              if (existingProperties) {
                toPush = {
                  ...(toPush as any),
                  selector: existingProperties.selector,
                  properties: (existingProperties as any).properties,
                } as any;
              }
            }

            // then we are doing an insertion.
            const [beforeId] = mutation.before;
            const beforeIndex = (entity.properties[mutation.term] as any[]).findIndex(r => r && r.id === beforeId);
            if (beforeIndex !== -1) {
              (entity.properties[mutation.term as any] as any[]).splice(beforeIndex + 1, 0, toPush);
            } else {
              (entity.properties[mutation.term as any] as any[]).push(toPush);
            }

            // Filter our placeholder used to keep track of the correct beforeIndex.
            (entity.properties[mutation.term as any] as any[]) = (entity.properties[
              mutation.term as any
            ] as any[]).filter(r => r !== null);
          }
        }
      },
    });
  }
}
