import { traverseDocument } from '../../frontend/shared/capture-models/helpers/traverse-document';
import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { RevisionRequest } from '../../frontend/shared/capture-models/types/revision-request';
import { deleteFrom } from './delete-from';
import { extractValidRevisionChanges } from './extract-valid-revision-changes';

export function updateRevisionInDocument(
  captureModel: CaptureModel,
  req: RevisionRequest,
  options: {
    allowAnonymous?: boolean;
    allowCanonicalChanges?: boolean;
    allowCustomStructure?: boolean;
  } = {}
) {
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
              if (existingSelector !== -1) {
                selector.revisedBy[existingSelector] = mutation.selector;
              } else {
                selector.revisedBy.push(mutation.selector);
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
                if (existingSelector !== -1) {
                  entity.selector.revisedBy[existingSelector] = mutation.selector;
                } else {
                  entity.selector.revisedBy.push(mutation.selector);
                }
              }
              continue;
            }

            if (mutation.type === 'selector-self') {
              const revised = entity.selector?.revisedBy;
              entity.selector = mutation.selector;
              // Don't allow updating the revised property directly here. Avoid messing up other peoples revisions.
              if (revised) {
                entity.selector.revisedBy = revised;
              }
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
            if (existing !== -1) {
              // Replace with a null value placeholder (filtered out further down) to preserve the index.
              (entity.properties[mutation.term as any][existing] as any) = null;
            }
            let toPush = mutation.type === 'entity' ? mutation.entity : mutation.field;

            // This performs a shallow merge, since the other properties should already be applied
            // in a previous step.
            if (mutation.type === 'entity' && mutation.shallow && existing !== -1) {
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
