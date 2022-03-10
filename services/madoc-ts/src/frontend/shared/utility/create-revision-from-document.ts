import { createChoice, generateId, traverseDocument } from '@capture-models/helpers';
import { CaptureModel } from '@capture-models/types';
import { generateModelFields } from '../../../utility/generate-model-fields';

export function createRevisionFromDocument(
  document: CaptureModel['document'],
  { ignoreMultiple, structure }: { ignoreMultiple?: boolean; structure?: CaptureModel['structure'] } = {}
): { model: CaptureModel; revisionId: string } {
  const rid = generateId();

  traverseDocument(document, {
    visitField(field, prop, parent) {
      field.revision = rid;
      if (prop === 'label' && parent && !parent.labelledBy) {
        parent.labelledBy = 'label';
      }
    },
    visitEntity(entity, prop) {
      entity.revision = rid;
      if (!ignoreMultiple) {
        entity.allowMultiple = true;
      }
    },
  });

  const model: CaptureModel = {
    structure: structure ? structure : createChoice(),
    document,
    id: generateId(),
    revisions: [
      {
        id: rid,
        source: 'canonical',
        fields: generateModelFields(document),
      },
    ],
  };

  return { model, revisionId: rid };
}
