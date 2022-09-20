import { generateId } from '../../frontend/shared/capture-models/helpers/generate-id';
import { traverseDocument } from '../../frontend/shared/capture-models/helpers/traverse-document';
import { CaptureModel, Target } from '../../frontend/shared/capture-models/types/capture-model';

export function cloneModel(model: CaptureModel, { target }: { target?: Target[] }): CaptureModel {
  const id = model.id;
  // @todo handle cloning with revisions
  const idMap: Record<string, string> = {};
  traverseDocument(model.document, {
    visitEntity(entity) {
      const newId = generateId();
      idMap[entity.id] = newId;
      entity.id = newId;
      entity.revision = undefined;
    },
    visitField(field) {
      const newId = generateId();
      idMap[field.id] = newId;
      field.id = newId;
      field.revision = undefined;
      field.revises = undefined;
    },
    visitSelector(selector) {
      const newId = generateId();
      idMap[selector.id] = newId;
      selector.id = newId;
      selector.revisionId = undefined;
    },
  });

  // Apply the revises field.
  traverseDocument(model.document, {
    visitEntity(entity) {
      if (entity.revises) {
        entity.revises = idMap[entity.revises] || undefined;
      }
    },
    visitField(field) {
      if (field.revises) {
        field.revises = idMap[field.revises] || undefined;
      }
    },
    visitSelector(selector) {
      if (selector.revises) {
        selector.revises = idMap[selector.revises] || undefined;
      }
    },
  });

  model.id = generateId();
  model.revisions = [];
  // @todo contributors.
  // model.contributors = creator ? { [creator.id]: creator } : {};
  model.derivedFrom = id;
  model.target = target;

  return model;
}
