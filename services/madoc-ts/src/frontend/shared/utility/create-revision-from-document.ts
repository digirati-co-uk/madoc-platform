import { generateModelFields } from '../../../utility/generate-model-fields';
import { createChoice } from '../capture-models/helpers/create-choice';
import { generateId } from '../capture-models/helpers/generate-id';
import { traverseDocument } from '../capture-models/helpers/traverse-document';
import { CaptureModel } from '../capture-models/types/capture-model';

export function createRevisionFromDocument(
  document: CaptureModel['document'],
  {
    ignoreMultiple,
    structure,
    generateIds,
  }: { ignoreMultiple?: boolean; structure?: CaptureModel['structure']; generateIds?: boolean } = {}
): { model: CaptureModel; revisionId: string } {
  const rid = generateId();

  traverseDocument(document, {
    visitField(field, prop, parent) {
      if (generateIds) {
        field.id = generateId();
        if (field.selector) {
          field.selector.id = generateId();
        }
      }
      field.revision = rid;
      if (prop === 'label' && parent && !parent.labelledBy) {
        parent.labelledBy = 'label';
      }
    },
    visitEntity(entity, prop) {
      if (generateIds) {
        entity.id = generateId();
        if (entity.selector) {
          entity.selector.id = generateId();
        }
      }
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
