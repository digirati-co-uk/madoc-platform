import copy from 'fast-copy';
import { pluginStore } from '../plugin-api/globals';
import { CaptureModel } from '../types/capture-model';
import { BaseField } from '../types/field-types';
import { filterDocumentGraph } from './filter-document-graph';
import { formPropertyValue } from './fork-field';
import { generateId } from './generate-id';
import { isEntity, isEntityList } from './is-entity';
import { splitDocumentByModelRoot } from './split-document-by-model-root';
import { traverseDocument } from './traverse-document';

interface ForkDocumentOptions<Fields extends string> {
  revisionId?: string;
  modelMapping?: Partial<{ [key in Fields]: string }>;
  modelRoot?: Fields[];
  removeValues?: boolean;
  removeDefaultValues?: boolean;
  editValues?: boolean;
  editableAboveRoot?: boolean;
  preventAdditionsAdjacentToRoot?: boolean;
  branchFromRoot?: boolean;
  addRevises?: boolean;
  keepListedValues?: boolean;
  fieldsToEdit?: string[];
}

/**
 * Fork template - The first "allowMultiple" below the root will be copied and
 * it's values nuked, as per template rules in fork template mode, fields above
 * will be copied (and revises set) Everything (immutable) above the model root
 * is marked as "allowMultiple=false"
 */
export function forkDocument<Fields extends string>(
  inputDoc: CaptureModel['document'],
  options: ForkDocumentOptions<Fields>
) {
  let { modelRoot = [] as Fields[] } = options;
  const {
    revisionId,
    modelMapping: inputModelMapping = {} as Required<ForkDocumentOptions<Fields>>['modelMapping'],
    removeValues = true,
    removeDefaultValues = false,
    editValues = false,
    editableAboveRoot = true,
    preventAdditionsAdjacentToRoot = true,
    branchFromRoot = false,
    addRevises = true,
    keepListedValues = false,
    fieldsToEdit,
  } = options;
  // New document.
  const document = copy(inputDoc);
  const modelMapping: Partial<typeof inputModelMapping> = {};

  if (modelRoot === null) {
    modelRoot = [];
  }

  // Filter out any items from the mapping that are not on the root.
  // Model mapping is used to filter the path to what you want to edit.
  for (const root of modelRoot) {
    if (inputModelMapping[root as Fields]) {
      modelMapping[root] = inputModelMapping[root];
    }
  }

  const [immutableDocuments, mutableDocuments] = splitDocumentByModelRoot(document, modelRoot);
  const documentsToPreventFurtherAdditions: CaptureModel['document'][] = [];
  // Iterate through `immutableDocuments` to find properties that are
  // marked as allowMultiple=true and set them to false. (also the doc itself)
  // also do NOT add revision ID to this.
  // @todo do this at the end when we do the full traverse + filter.
  immutableDocuments.forEach(docList => {
    docList.documents.forEach(doc => {
      doc.immutable = true;
      if (doc.allowMultiple) {
        doc.allowMultiple = false;
      }

      Object.keys(doc.properties).forEach(term => {
        const prop = doc.properties[term];
        prop.forEach((field: BaseField | CaptureModel['document']) => {
          // These are all of the fields above the root.
          if (!isEntity(field) && !editableAboveRoot) {
            field.allowMultiple = false;
          }
          if (isEntity(field)) {
            documentsToPreventFurtherAdditions.push(field);
          }
        });
      });
    });
  });

  // This is an invalid state.
  if (mutableDocuments.length === 0 || mutableDocuments[0].documents.length === 0) {
    throw new Error('Document not found at root');
  }

  const [documentsToKeep, documentsToRemove] = filterDocumentGraph(immutableDocuments, modelMapping);
  // This is the glue between the top and bottom. If something has been removed in the top, we want it removed
  // from the bottom.
  for (const mutableDocument of mutableDocuments) {
    if (mutableDocument.parent && documentsToRemove.indexOf(mutableDocument.parent) !== -1) {
      documentsToRemove.push(...mutableDocument.documents);
    } else {
      const filteredId = modelMapping[mutableDocument.property as Fields];
      if (filteredId) {
        for (const doc of mutableDocument.documents) {
          if (doc.id === filteredId) {
            documentsToKeep.push(doc);
          } else {
            documentsToRemove.push(doc);
          }
        }
      } else {
        documentsToKeep.push(...mutableDocument.documents);
      }
    }
  }

  const actions = {
    parentRemoved(item: any) {
      return actions.setValue(item, 'isParentRemoved', true);
    },
    isParentRemoved(item: any) {
      return actions.getValue(item, 'isParentRemoved');
    },

    filterParent(item: any) {
      return actions.setValue(item, 'isParentFiltered', true);
    },

    isParentFiltered(item: any) {
      return actions.getValue(item, 'isParentFiltered');
    },

    parentHasBranched(item: any) {
      if (!item) {
        return false;
      }
      return item.temp && item.temp.hasBranched;
    },

    branch(item: any) {
      return actions.setValue(item, 'hasBranched', true);
    },

    setValue(item: any, key: string, value: any) {
      item.temp = item.temp ? item.temp : {};
      item.temp[key] = value;
    },
    getValue(item: any, key: string) {
      return !!(item && item.temp && item.temp[key]);
    },
  };

  traverseDocument<{
    hasBranched?: boolean;
    parentRemoved?: boolean;
    parentKept?: boolean;
  }>(document, {
    visitProperty(property, items, parent) {
      if (isEntityList(items)) {
        return;
      }
      const toRemove: string[] = [];
      for (const field of items) {
        if (field.revises) {
          toRemove.push(field.revises);
        }
      }
      if (toRemove.length) {
        parent.properties[property] = items.filter(item => toRemove.indexOf(item.id) === -1);
      }
    },
    visitField(field, key, parent) {
      // This is partially a validation step to ensure the plugin exists.
      const description = pluginStore.fields[field.type];
      if (!description) {
        // error? delete?
        parent.properties[key] = [];
        return;
      }

      // If we're editing, nothing to do.
      if (editValues) {
        return;
      }

      // Hard turn here if we have fieldsToEdit.
      // - If we have fields to edit, we want to only include the fields from that list.
      // - If we don't we only want a template of the first one if the parent has branched.
      if (fieldsToEdit) {
        if (fieldsToEdit.indexOf(field.id) === -1) {
          parent.properties[key] = (parent.properties[key] as any[]).filter(f => f.id !== field.id);
          return;
        }

        formPropertyValue(field, {
          revision: !field.immutable ? revisionId : undefined,
          revisesFork: !field.immutable && (!(description.allowMultiple && field.allowMultiple) || addRevises),
          forkValue: !(removeValues && (removeDefaultValues || field.revision)),
          clone: false,
        });
      } else {
        // If we're not editing, then we're copying. There's only so much we're allow to copy.
        // If the field is part of an entity that has already been copied, then it's a new field
        // and should be marked as one, without a revises.
        // If the field allows multiple (and not part of a new branch) then we can add a new instance
        // to the value.
        formPropertyValue(field, {
          revision: !field.immutable ? revisionId : undefined,
          revisesFork:
            !field.immutable &&
            !actions.parentHasBranched(parent) &&
            (!(description.allowMultiple && field.allowMultiple) || addRevises),
          forkValue: !(removeValues && (removeDefaultValues || field.revision)),
          clone: false,
        });

        if (keepListedValues) {
          return;
        }

        if (!field.immutable && (actions.parentHasBranched(parent) || !addRevises)) {
          parent.properties[key] = [field];
        }
      }
    },
    visitEntity(entity, key, parent) {
      if (branchFromRoot && !parent) {
        actions.branch(entity);
      }
      // If the parent has multiple values, and we're not editing and removing values (fork)
      if (parent && key && !actions.isParentFiltered(parent) && !editValues && removeValues) {
        // Then we want to make this the only entity, I think. This will already be pre-filtered if
        // an ID is selected.
        parent.properties[key] = [entity];
        actions.filterParent(parent);
      }
    },
    beforeVisitEntity(entity, key, parent) {
      const filteredId = modelMapping[key as Fields];
      if (filteredId && entity.id === filteredId) {
        if (parent && key) {
          parent.properties[key] = [entity];
          actions.filterParent(parent);
        }
      }

      if (documentsToRemove.indexOf(entity) !== -1 || actions.isParentRemoved(parent)) {
        if (parent && key) {
          actions.parentRemoved(entity);
          parent.properties[key] = (parent.properties[key] as CaptureModel['document'][]).filter(
            prop => prop !== entity
          );
        }
        return;
      }

      const hasParentDocumentBranched = actions.parentHasBranched(parent);
      const isDocumentImmutable = !!entity.immutable; // i.e. the forking has to start later in the tree.
      const isEditingIndividualFields = !!(fieldsToEdit && fieldsToEdit.length);
      const isInModelMapping = modelMapping[key as Fields] === entity.id;
      const willBranch =
        !!parent && !isEditingIndividualFields && (hasParentDocumentBranched || (!isDocumentImmutable && !editValues));

      // - if parent has branched, we NEED to branch. This can only happen if other cases pass, so we can
      // safely do this.
      // - if the document is immutable, we cannot branch, other items adjacent to this document _may_ have
      // been removed.
      // - if we are forking, then we can check if the item allows multiple values and create a new one, or
      // if it does not and create a revises, similar to fields.
      // - If we do fork, we mark the item as branched for the fields to pick up
      if (willBranch) {
        // console.log('BRANCHING', entity);

        if ((entity.allowMultiple || hasParentDocumentBranched) && !isInModelMapping) {
          entity.id = generateId();
          entity.immutable = false;
        } else {
          entity.revises = entity.id;
          entity.id = generateId();
          entity.immutable = false;
        }
        if (entity.selector) {
          entity.selector.id = generateId();
        }
        if (revisionId) {
          entity.revision = revisionId;
        }
        actions.branch(entity);
      } else {
        entity.immutable = true;
      }
    },
  });

  if (preventAdditionsAdjacentToRoot) {
    // Prevent the documents at the root from being added to.
    for (const doc of documentsToPreventFurtherAdditions) {
      doc.allowMultiple = false;
    }
  }

  return document;
}

/**
 * Wrapper around fork document.
 * @param revisionId
 * @param document
 * @param mode
 * @param modelRoot
 * @param modelMapping
 * @param fieldsToEdit
 */
export function createRevisionDocument(
  revisionId: string,
  document: CaptureModel['document'],
  mode: any,
  modelRoot: string[] = [],
  modelMapping: Partial<{ [key: string]: string }> = {},
  fieldsToEdit?: string[]
) {
  switch (mode) {
    case 'EDIT_ALL_VALUES':
      return forkDocument(document, { revisionId, modelRoot, modelMapping, editValues: true });
    case 'FORK_SOME_VALUES':
      return forkDocument(document, { revisionId, modelRoot, modelMapping, fieldsToEdit, removeValues: false });
    case 'FORK_ALL_VALUES':
      return forkDocument(document, { revisionId, modelRoot, modelMapping, removeValues: false });
    case 'FORK_LISTED_VALUES':
      return forkDocument(document, {
        revisionId,
        modelRoot,
        modelMapping,
        removeValues: false,
        keepListedValues: true,
      });
    case 'FORK_TEMPLATE':
      return forkDocument(document, { revisionId, modelRoot, removeDefaultValues: true, removeValues: true });
    case 'FORK_INSTANCE':
      return forkDocument(document, {
        revisionId,
        modelRoot,
        removeDefaultValues: true,
        removeValues: true,
        addRevises: false,
      });
  }
  throw new Error();
}
