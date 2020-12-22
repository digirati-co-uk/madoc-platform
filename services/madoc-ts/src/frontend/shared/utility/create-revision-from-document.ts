import { createChoice, generateId, traverseDocument } from '@capture-models/helpers';
import { CaptureModel } from '@capture-models/types';

export function createRevisionFromDocument(
  document: CaptureModel['document']
): { model: CaptureModel; revisionId: string } {
  const rid = generateId();

  traverseDocument(document, {
    visitField(field, prop, parent) {
      field.revision = rid;
      if (prop === 'label' && parent) {
        parent.labelledBy = 'label';
      }
    },
    visitEntity(entity, prop) {
      entity.revision = rid;
      entity.allowMultiple = true;
    },
  });

  const model: CaptureModel = {
    structure: createChoice(),
    document,
    id: generateId(),
    revisions: [
      {
        id: rid,
        source: 'canonical',
        fields: Object.keys(document.properties),
      },
    ],
  };

  return { model, revisionId: rid };
}
