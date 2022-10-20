import { traverseDocument } from '../../frontend/shared/capture-models/helpers/traverse-document';
import { validateRevision } from '../../frontend/shared/capture-models/helpers/validate-revision';
import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { BaseField } from '../../frontend/shared/capture-models/types/field-types';
import { RevisionRequest } from '../../frontend/shared/capture-models/types/revision-request';
import { BaseSelector } from '../../frontend/shared/capture-models/types/selector-types';
import { getBefore } from './get-before';

export function extractValidRevisionChanges(
  captureModel: CaptureModel,
  req: RevisionRequest,
  {
    allowAnonymous,
    allowCanonicalChanges,
    allowCustomStructure,
  }: {
    allowAnonymous?: boolean;
    allowCanonicalChanges?: boolean;
    allowCustomStructure?: boolean;
  }
) {
  if (!req.document.immutable) {
    req.document.immutable = true;
  }

  const filteredDocument = validateRevision(req, captureModel, {
    allowAnonymous,
    allowCanonicalChanges,
    allowCustomStructure,
  });
  const allIds: string[] = [];
  const mutations: Record<
    string,
    Array<
      | {
          id: string;
          type: 'deletion';
        }
      | {
          id: string;
          type: 'entity';
          entity: CaptureModel['document'];
          term: string;
          shallow?: boolean;
          before: [string | null, number];
        }
      | {
          id: string;
          type: 'field';
          field: BaseField;
          term: string;
          before: [string | null, number];
        }
      | {
          id: string;
          type: 'selector';
          selector: BaseSelector;
          parentSelector?: BaseSelector;
        }
      | {
          id: string;
          type: 'selector-self';
          selector: BaseSelector;
        }
    >
  > = {};

  if (filteredDocument) {
    // @todo if `allowCanonicalChanges` is true, then this strategy probably will not work.
    //   When this is set we need to allow updating all properties of the included entities and fields
    //   But we can assume they might be incomplete (not all properties in the document for example).
    //   A better strategy might be to simply replace the values shallow-ly

    // 1st traverse the revision to get the fields that need added.
    traverseDocument(filteredDocument, {
      visitField(field, term, parent) {
        // Removing this immutability check. Not sure where it was required.
        if (allowCanonicalChanges || /*parent.immutable && */ field.revision === req.revision.id) {
          allIds.push(field.id);
          mutations[parent.id] = mutations[parent.id] ? mutations[parent.id] : [];
          mutations[parent.id].push({
            id: field.id,
            type: 'field',
            field,
            term,
            before: getBefore(field, term, parent),
          });
        }
      },
      visitEntity(entity, term, parent) {
        if (parent && term && (allowCanonicalChanges || (!entity.immutable && entity.revision === req.revision.id))) {
          allIds.push(entity.id);
          mutations[parent.id] = mutations[parent.id] ? mutations[parent.id] : [];
          mutations[parent.id].push({
            id: entity.id,
            type: 'entity',
            entity,
            term,
            shallow: allowCanonicalChanges,
            before: getBefore(entity, term, parent),
          });
        }
      },
      visitSelector(selector, parent, isRevision, parentSelector) {
        if (allowCanonicalChanges) {
          allIds.push(selector.id);
          mutations[selector.id] = mutations[selector.id] ? mutations[selector.id] : [];
          mutations[selector.id].push({
            id: selector.id,
            type: 'selector-self',
            selector,
          });
        } else if (isRevision && parentSelector && selector.revisionId && selector.revisionId === req.revision.id) {
          allIds.push(selector.id);
          mutations[parentSelector.id] = mutations[parentSelector.id] ? mutations[parentSelector.id] : [];
          mutations[parentSelector.id].push({ id: selector.id, type: 'selector', selector, parentSelector });
        }
      },
    });
  }

  // Optionally traverse to find valid fields to be removed.
  const requestedToDelete = req.revision.deletedFields || [];
  const validToDelete: string[] = [];

  traverseDocument(captureModel.document, {
    visitEntity(entity) {
      if (!entity.immutable && requestedToDelete.indexOf(entity.id) !== -1) {
        validToDelete.push(entity.id);
      }
      if (allIds.indexOf(entity.id) === -1 && entity.revision === req.revision.id) {
        // This is a deletion
        mutations[entity.id] = [{ type: 'deletion', id: entity.id }];
      }
    },
    visitField(field) {
      if (!field.immutable && requestedToDelete.indexOf(field.id) !== -1) {
        validToDelete.push(field.id);
      }
      if (allIds.indexOf(field.id) === -1 && field.revision === req.revision.id) {
        // This is a deletion
        mutations[field.id] = [{ type: 'deletion', id: field.id }];
      }
    },
    visitSelector(selector, _, isRevision) {
      if (selector && isRevision && allIds.indexOf(selector.id) === -1 && selector.revisionId === req.revision.id) {
        // This is a deletion
        mutations[selector.id] = [{ type: 'deletion', id: selector.id }];
      }
    },
  });

  req.revision.deletedFields = validToDelete;

  return {
    mutations,
    deletions: validToDelete,
  };
}
