import { action, computed, createStore, debug, thunk } from 'easy-peasy';
import { captureModelToRevisionList } from '../../../helpers/capture-model-to-revision-list';
import { createNewEntityInstance } from '../../../helpers/create-new-entity-instance';
import { createNewFieldInstance } from '../../../helpers/create-new-field-instance';
import { createRevisionDocument } from '../../../helpers/create-revision-document';
import { createRevisionRequest } from '../../../helpers/create-revision-request';
import { filterEmptyStructures } from '../../../helpers/filter-empty-structures';
import { forkFieldEditMode } from '../../../helpers/fork-field-edit-mode';
import { forkSelectorEditMode } from '../../../helpers/fork-selector-edit-mode';
import { generateId } from '../../../helpers/generate-id';
import { getRevisionFieldFromPath } from '../../../helpers/get-revision-field-from-path';
import { isEntity } from '../../../helpers/is-entity';
import { resolveSelector } from '../../../helpers/resolve-selector';
import { resolveSubtreeWithIds } from '../../../helpers/resolve-subtree-with-ids';
import { traverseStructure } from '../../../helpers/traverse-structure';
import { CaptureModel } from '../../../types/capture-model';
import { BaseField } from '../../../types/field-types';
import { BaseSelector } from '../../../types/selector-types';
import { RevisionsModel } from './revisions-model';
import { createSelectorStore, updateSelectorStore } from '../selectors/selector-store';
import { batchedSubscribe } from 'redux-batched-subscribe';
import { unstable_batchedUpdates } from 'react-dom';

export const revisionStore: RevisionsModel = {
  // Can we safely assume the structure won't change in this store? - I think so.
  // Do we need a "root" revision for items without a revision ID?
  // Actually – root revisions can have the SAME id as the structure choice, since they are just the revision
  // for that actual structure. If it's not in the structure AND not in a revision then it can't be edited in
  // the capture model editor, unless you edit the whole document at once.
  revisions: {},

  // Edit mode.
  revisionEditMode: false,
  setRevisionMode: action((state, payload) => {
    state.revisionEditMode = payload.editMode;
  }),

  // The revision.
  currentRevisionId: null,
  currentRevision: computed(state =>
    state.currentRevisionId && state.revisions[state.currentRevisionId]
      ? state.revisions[state.currentRevisionId]
      : null
  ),
  unsavedRevisionIds: [],
  currentRevisionReadMode: false,

  // Revision fields.
  revisionSubtreePath: [], // Path to current entity.
  revisionSelectedFieldProperty: null,
  revisionSelectedFieldInstance: null, // ID of selected field instance.
  revisionSubtree: computed(
    [
      // Subtree path string[]
      state => state.revisionSubtreePath,
      // Current revision document
      state => {
        if (!state.currentRevisionId) {
          return undefined;
        }
        return state.revisions[state.currentRevisionId].document;
      },
    ],
    (subtreePath, document) => {
      if (!document) {
        return undefined;
      }

      return resolveSubtreeWithIds(subtreePath, document);
    }
  ),
  revisionSubtreeField: computed(
    [
      state => state.revisionSubtree,
      state => state.revisionSelectedFieldProperty,
      state => state.revisionSelectedFieldInstance,
    ],
    (subtree, property, id) => {
      if (!subtree || !property || !id || !isEntity(subtree)) {
        return undefined;
      }

      const prop = subtree.properties[property];

      if (!prop) {
        return undefined;
      }

      return (prop as any[]).find(e => e.id === id);
    }
  ),
  revisionSubtreeFieldKeys: computed([state => state.revisionSubtree], subtree =>
    subtree && isEntity(subtree) ? Object.keys(subtree.properties) : []
  ),
  revisionSubtreeFields: computed(
    [state => state.revisionSubtreeFieldKeys, state => state.revisionSubtree],
    (keys: string[], subtree: CaptureModel['document'] | BaseField | undefined) => {
      if (!subtree || !isEntity(subtree)) {
        return [];
      }
      return keys.map(key => {
        const item = subtree.properties[key];

        return { term: key, value: item as Array<BaseField | CaptureModel['document']> };
      });
    }
  ),

  // Subtree actions
  revisionSetSubtree: action((state, terms) => {
    state.revisionSelectedFieldProperty = null;
    state.revisionSelectedFieldInstance = null;
    state.revisionSubtreePath = terms;
  }),

  // A helper to push a new subtree path, useful for navigation.
  revisionPushSubtree: action((state, { term, id, skip = false }) => {
    state.revisionSelectedFieldProperty = null;
    state.revisionSelectedFieldInstance = null;
    state.revisionSubtreePath.push([term, id, skip]);
  }),

  // A helper to pop the last subtree path, useful for navigation.
  revisionPopSubtree: action(state => {
    state.revisionSelectedFieldProperty = null;
    state.revisionSelectedFieldInstance = null;

    const path = debug(state.revisionSubtreePath);
    const lastIndex = path.length - 1;
    let toSlice = 0;
    for (let i = lastIndex; i >= 0; i--) {
      toSlice++;
      const skip = path[lastIndex][2];
      if (!skip) break;
    }

    state.revisionSubtreePath = path.slice(0, path.length - toSlice);
  }),

  revisionPopTo: action((state, payload) => {
    state.revisionSelectedFieldProperty = null;
    state.revisionSelectedFieldInstance = null;

    const path = debug(state.revisionSubtreePath);
    const lastIndex = path.length - 1;
    let toSlice = 0;
    for (let i = lastIndex; i >= 0; i--) {
      toSlice++;
      const upToId = path[lastIndex][1] === payload.id;
      if (upToId) break;
    }

    state.revisionSubtreePath = path.slice(0, path.length - toSlice);
  }),

  // A way to set the selected field.
  revisionSelectField: action((state, { term, id }) => {
    if (!state.currentRevisionId) {
      throw new Error('No revision selected');
    }
    const revisionDocument = state.revisions[state.currentRevisionId].document;

    if (resolveSubtreeWithIds(state.revisionSubtreePath, revisionDocument).properties[term]) {
      state.revisionSelectedFieldProperty = term;
      state.revisionSelectedFieldInstance = id;
    }
  }),

  // A simple way to deselect all fields.
  revisionDeselectField: action(state => {
    state.revisionSelectedFieldProperty = null;
    state.revisionSelectedFieldInstance = null;
  }),

  // Structure navigation.
  structure: undefined,
  idStack: [],
  isThankYou: false,
  isPreviewing: false,

  structureMap: computed([state => state.structure], structure => {
    const map: { [id: string]: any } = {};
    if (structure) {
      traverseStructure(structure, (item, path) => {
        map[item.id] = {
          id: item.id,
          structure: item,
          path,
        };
      });
    }
    return map;
  }),
  currentStructureId: computed([state => state.idStack, state => state.structure], (idStack, structure) => {
    return idStack[idStack.length - 1] ? idStack[idStack.length - 1] : structure ? structure.id : undefined;
  }),
  currentStructure: computed(
    [state => state.currentStructureId, state => state.structureMap],
    (currentId, structureMap) => {
      if (!currentId) {
        return undefined;
      }
      return structureMap[currentId].structure;
    }
  ),
  choiceStack: computed([state => state.idStack, state => state.structureMap], (idStack, structureMap) => {
    return idStack.map(id => structureMap[id]);
  }),
  goToStructure: action((state, id) => {
    const nextStructure = state.structureMap[id];
    if (nextStructure) {
      state.idStack = nextStructure.path;
    }
  }),
  pushStructure: action((state, id) => {
    if (state.structureMap[id]) {
      state.idStack.push(id);
    }
  }),
  popStructure: action(state => {
    state.idStack = state.idStack.slice(0, -1);
  }),
  setIsThankYou: action((state, payload) => {
    state.isThankYou = payload;
  }),
  setIsPreviewing: action((state, payload) => {
    state.isPreviewing = payload;
  }),

  // Empty state for selectors. This will be populated when you select a revision and be reset when you deselect one.
  // It contains the basic state for what's currently selected.
  selector: createSelectorStore(),
  setCaptureModel: action((state, payload) => {
    const revisions = captureModelToRevisionList(payload.captureModel, !payload.excludeStructures).reduce(
      (mapOfRevisions, nextRevision) => {
        mapOfRevisions[nextRevision.revision.id] = nextRevision;
        return mapOfRevisions;
      },
      {} as any
    );

    if (payload.initialRevision && revisions[payload.initialRevision]) {
      state.currentRevisionId = payload.initialRevision;
      state.currentRevisionReadMode = !!payload.initialRevisionReadMode;
      state.selector = createSelectorStore(revisions[payload.initialRevision].document);
    } else {
      state.currentRevisionId = null;
      state.currentRevisionReadMode = false;
      state.selector = createSelectorStore();
    }

    // @todo error handling - tiny case where there is a null structure?
    state.structure =
      filterEmptyStructures(payload.captureModel) ||
      ({
        type: 'choice',
        items: [],
      } as any);
    state.revisions = revisions;
    state.unsavedRevisionIds = [];
  }),

  chooseSelector: action((state, payload) => {
    if (state.selector.availableSelectors.find(selector => selector.id === payload.selectorId)) {
      state.selector.currentSelectorId = payload.selectorId;
    }
  }),
  clearSelector: action(state => {
    state.selector.currentSelectorId = null;
  }),
  clearTopLevelSelector: action(state => {
    state.selector.topLevelSelector = null;
  }),
  setTopLevelSelector: action((state, payload) => {
    state.selector.topLevelSelector = payload.selectorId;
  }),

  // @todo update selector in revision too (not ideal, but avoids traversing tree each time to find a selector)
  updateSelector: action((state, payload) => {
    const selectorToUpdate = state.selector.availableSelectors.find(selector => selector.id === payload.selectorId);
    if (selectorToUpdate) {
      const path = state.selector.selectorPaths[selectorToUpdate.id];
      const field = getRevisionFieldFromPath<BaseField>(state, path);

      if (
        state.revisionEditMode &&
        state.currentRevisionId &&
        (!field?.revision || field.revision !== state.currentRevisionId)
      ) {
        const existingRevisedSelector = selectorToUpdate.revisedBy
          ? selectorToUpdate.revisedBy.find((r: any) => r.revisionId === state.currentRevisionId)
          : undefined;
        if (existingRevisedSelector) {
          // We have already "forked" this selector, update it.
          existingRevisedSelector.state = payload.state;
          // Also need to update the field.
        } else {
          const newSelector = forkSelectorEditMode(selectorToUpdate, state.currentRevisionId, payload.state);
          if (selectorToUpdate.revisedBy) {
            selectorToUpdate.revisedBy.push(newSelector);
          } else {
            selectorToUpdate.revisedBy = [newSelector];
          }

          if (field && field.selector) {
            if (!field.selector.revisedBy) {
              field.selector.revisedBy = [newSelector];
            } else {
              field.selector.revisedBy.push(newSelector);
            }
          }
        }

        if (field && field.selector) {
          const existingRevisedFieldSelector = field.selector.revisedBy
            ? field.selector.revisedBy.find(r => r.revisionId === state.currentRevisionId)
            : undefined;

          // If the existing selector exists, then update it, otherwise create it.
          if (existingRevisedFieldSelector) {
            existingRevisedFieldSelector.state = payload.state;
          }
        }

        return;
      }

      // Normal fallback. Simply update the selector and the field selector.
      selectorToUpdate.state = payload.state;
      if (field && field.selector) {
        field.selector.state = payload.state;
      }
    }
  }),
  // @todo update selector on revision
  updateSelectorPreview: action((state, payload) => {
    state.selector.selectorPreviewData[payload.selectorId] = payload.preview;
  }),
  addVisibleSelectorIds: action((state, payload) => {
    for (const id of payload.selectorIds) {
      if (state.selector.visibleSelectorIds.indexOf(id) === -1) {
        state.selector.visibleSelectorIds.push(id);
      }
    }
  }),
  removeVisibleSelectorIds: action((state, payload) => {
    state.selector.visibleSelectorIds = state.selector.visibleSelectorIds.filter(
      selector => payload.selectorIds.indexOf(selector) === -1
    );
  }),
  updateCurrentSelector: thunk<RevisionsModel, BaseSelector['state']>((actions, payload, helpers) => {
    const state = helpers.getState().selector;
    if (state.currentSelectorId) {
      actions.updateSelector({ selectorId: state.currentSelectorId, state: payload });
    }
  }),

  // Future options:
  // - Show only focused annotations
  // - Hide current entity
  // - Show all annotations below
  visibleCurrentLevelSelectorIds: computed([state => state.revisionSubtree], currentSubtree => {
    // By default if you were on a paragraph, this would return the paragraph and all of the lines.
    // It would be up to some external configuration to not show the paragraph if desired. Perhaps a configuration
    // in here in the future, or configuration in the viewer.
    if (!currentSubtree) {
      return [];
    }
    const selectors = [];

    if (currentSubtree.selector) {
      selectors.push(currentSubtree.selector.id);
    }
    if (isEntity(currentSubtree)) {
      const props = Object.keys(currentSubtree.properties);
      for (const prop of props) {
        const fields = currentSubtree.properties[prop];
        for (const field of fields) {
          if (field.selector) {
            selectors.push(field.selector.id);
          }
        }
      }
    }

    return selectors;
  }),

  revisionAdjacentSubtreeFields: computed(
    [
      // Subtree path string[]
      state => state.revisionSubtreePath,
      // Current revision document
      state => {
        if (!state.currentRevisionId) {
          return undefined;
        }
        return state.revisions[state.currentRevisionId].document;
      },
    ],
    (subtreePath, document) => {
      if (!document) {
        return { fields: [], currentId: undefined };
      }

      if (subtreePath.length === 0) {
        return { fields: [], currentId: undefined };
      }

      const [property, currentId] = subtreePath[subtreePath.length - 1];
      const adj = resolveSubtreeWithIds(subtreePath.slice(0, -1), document);

      return {
        fields: (adj.properties[property] || []) as any[],
        currentId,
      };
    }
  ),

  visibleAdjacentSelectorIds: computed(
    [
      // Subtree path string[]
      state => state.revisionAdjacentSubtreeFields,
    ],
    ({ fields, currentId }) => {
      const adjacentFields = fields.filter(field => field.id !== currentId);

      const selectors = [];
      for (const adjacentField of adjacentFields) {
        if (adjacentField.selector) {
          selectors.push(adjacentField.selector.id);
        }
      }
      return selectors;
    }
  ),

  // This method assumes we have the latest capture model available, which may not
  // be the case. This needs to be more generic.
  createRevision: action<RevisionsModel>(
    (state, { revisionId, readMode, cloneMode, modelMapping, modelRoot, fieldsToEdit }) => {
      const baseRevision = state.revisions[revisionId];
      // Structure ID is the structure from the capture model, so if this exists we can set fields.
      if (!baseRevision) {
        console.warn('Invalid base revision', revisionId, debug(state.revisions));
        throw new Error(`Invalid base revision ${revisionId}`);
      }
      // Document
      const documentToClone = baseRevision.document;
      // New id
      const newRevisionId = generateId();
      // Create document
      const newDocument = createRevisionDocument(
        newRevisionId,
        debug(documentToClone) as CaptureModel['document'],
        cloneMode,
        modelRoot ? modelRoot : baseRevision.modelRoot,
        modelMapping,
        fieldsToEdit
      );
      // Add new revision request
      const newRevisionRequest = createRevisionRequest(
        baseRevision.captureModelId as string,
        baseRevision.revision,
        newDocument
      );
      // Update Id of revision.
      newRevisionRequest.revision = {
        ...baseRevision.revision,
        approved: false, // @todo this is where auto-approval config might go, will still be server checked.
        id: newRevisionId,
        revises: baseRevision.revision.id,
      };
      // Save new revision request.
      state.revisions[newRevisionId] = newRevisionRequest;
      // Save it to state.
      state.currentRevisionId = newRevisionId;
      state.currentRevisionReadMode = !!readMode;
      state.selector = createSelectorStore(newDocument);
      state.unsavedRevisionIds.push(newRevisionId);
      state.revisionSubtreePath = [];
    }
  ),

  persistRevision: thunk(
    async (actions, { revisionId: customRevisionId, createRevision, updateRevision, status }, helpers) => {
      // First persist to get new
      const state = helpers.getState();
      const revisionId = customRevisionId ? customRevisionId : state.currentRevisionId;
      if (!revisionId) {
        // @todo error handling?
        return;
      }
      const oldRevision = state.revisions[revisionId];
      if (state.unsavedRevisionIds.indexOf(revisionId) !== -1) {
        const newRevision = await createRevision(oldRevision, status);
        actions.importRevision({ revisionRequest: newRevision });
        actions.saveRevision({ revisionId });
      } else {
        const newRevision = await updateRevision(oldRevision, status);
        actions.importRevision({ revisionRequest: newRevision });
      }
    }
  ),

  importRevision: action((state, { revisionRequest }) => {
    state.revisions[revisionRequest.revision.id] = revisionRequest;
  }),

  setRevisionLabel: action((state, { revisionId: customRevisionId, label }) => {
    const revisionId = customRevisionId ? customRevisionId : state.currentRevisionId;

    if (!revisionId || !state.revisions[revisionId]) {
      // Error?
      return;
    }

    state.revisions[revisionId].revision.label = label;
  }),

  // @todo Not sure what this will do yet, might be a thunk.
  saveRevision: action((state, { revisionId }) => {
    state.unsavedRevisionIds = state.unsavedRevisionIds.filter(unsavedId => unsavedId !== revisionId);
  }),

  // Just sets the id.
  selectRevision: action((state, { revisionId, readMode }) => {
    // @todo this might be where we go through and initialise the selector section of the store. This needs to be
    //    reliable.
    if (state.revisions[revisionId]) {
      // Add the current revision
      state.currentRevisionId = revisionId;
      state.currentRevisionReadMode = !!readMode;
      // Set up our selector store.
      state.selector = createSelectorStore(debug(state.revisions[revisionId].document) as CaptureModel['document']);
      // Reset breaking state.
      state.revisionSubtreePath = [];
      state.revisionSelectedFieldInstance = null;
      state.revisionSelectedFieldInstance = null;
      state.isThankYou = false;
      state.isPreviewing = false;
    }
  }),
  deselectRevision: action(state => {
    state.currentRevisionId = null;
    state.currentRevisionReadMode = false;
    state.selector = createSelectorStore();
    state.revisionSelectedFieldInstance = null;
    state.revisionSelectedFieldProperty = null;
    state.revisionSubtreePath = [];
    state.currentRevisionReadMode = false;
  }),

  // These will probably have to walk through the revision.
  updateFieldValue: action((state, { value, path, revisionId }) => {
    const field = getRevisionFieldFromPath<BaseField>(state, path, revisionId);
    const parent = getRevisionFieldFromPath<CaptureModel['document']>(state, path.slice(0, -1), revisionId);
    if (field) {
      field.value = value;

      if (state.revisionEditMode && state.currentRevisionId && parent && parent.revision !== state.currentRevisionId) {
        const { newSelectors } = forkFieldEditMode(field, state.currentRevisionId);
        if (newSelectors) {
          for (const newSelector of newSelectors) {
            state.selector.availableSelectors.push(newSelector);
            state.selector.selectorPaths[newSelector.id] = [...path];
          }
        }
      }
    }
  }),

  createNewFieldInstance: action((state, { property, path, revisionId }) => {
    // Grab the parent entity where we want to add a new field.
    const entity = getRevisionFieldFromPath<CaptureModel['document']>(state, path, revisionId);
    if (!entity) {
      throw new Error('invalid entity');
    }

    // Fork a new field from what already exists.
    const newField = createNewFieldInstance(debug(entity), property);

    if (newField) {
      newField.revision = state.currentRevisionId || undefined;
    }

    // Push it onto the properties.
    (entity.properties[property] as BaseField[]).push(newField);
    // Track selector.
    if (newField.selector) {
      state.selector.availableSelectors.push(newField.selector);
      state.selector.selectorPaths[newField.selector.id] = [...path, [property, newField.id]];
    }
  }),
  createNewEntityInstance: action((state, { property, path, revisionId }) => {
    // - @todo maybe an option for "number of instances" to create
    // - @todo Respect model root option
    // - @todo add model root to UI editor.

    // Grab the parent entity where we want to add a new field.
    const entity = getRevisionFieldFromPath<CaptureModel['document']>(state, path, revisionId);
    if (!entity) {
      throw new Error('invalid entity');
    }

    // Fork a new field from what already exists.
    const newEntity: CaptureModel['document'] = createNewEntityInstance(
      debug(entity),
      property,
      false,
      state.currentRevisionId
    );

    if (newEntity) {
      // Always add the current revision.
      newEntity.revision = state.currentRevisionId || undefined;
    }

    const { availableSelectors, selectorPaths } = updateSelectorStore(newEntity, [...path, [property, newEntity.id]]);

    if (availableSelectors.length) {
      state.selector.availableSelectors.push(...availableSelectors);
      const keys = Object.keys(selectorPaths);
      for (const key of keys) {
        state.selector.selectorPaths[key] = selectorPaths[key];
      }
    }

    // Push it onto the properties.
    (entity.properties[property] as CaptureModel['document'][]).push(newEntity);
  }),
  removeInstance: action((state, { path, revisionId }) => {
    const [fieldProp, fieldId] = path.slice(-1)[0];
    const pathToResource = path.slice(0, -1);
    // console.log('removing instance', pathToResource, fieldProp, fieldId);
    const entity = getRevisionFieldFromPath<CaptureModel['document']>(state, pathToResource, revisionId);

    const fields = entity ? entity.properties[fieldProp] : undefined;
    if (entity && fields) {
      if (fields.length === 1) {
        throw new Error('Cannot delete last item');
      }
      const fieldOrEntity = (debug(fields) as any[]).find(f => f.id === fieldId);

      if (state.currentRevisionId && fieldOrEntity.revision !== state.currentRevisionId) {
        if (!state.revisions[state.currentRevisionId].revision.deletedFields) {
          state.revisions[state.currentRevisionId].revision.deletedFields = [fieldOrEntity.id];
        } else {
          // @ts-ignore
          state.revisions[state.currentRevisionId].revision.deletedFields.push(fieldOrEntity.id);
        }
      }

      if (fieldOrEntity.type === 'entity') {
        const { availableSelectors } = updateSelectorStore(fieldOrEntity);
        if (availableSelectors.length) {
          const availableSelectorIds = availableSelectors.map(f => f.id);
          state.selector.availableSelectors = state.selector.availableSelectors.filter(
            s => availableSelectorIds.indexOf(s.id) === -1
          );
          for (const sId of availableSelectorIds) {
            delete state.selector.selectorPaths[sId];
          }
        }
      } else {
        if (fieldOrEntity.selector) {
          state.selector.availableSelectors = state.selector.availableSelectors.filter(
            s => s.id !== fieldOrEntity.selector.id
          );
          delete state.selector.selectorPaths[fieldOrEntity.selector];
        }
      }

      entity.properties[fieldProp] = (fields as any[]).filter(f => f.id !== fieldId);
    }
  }),

  // Computed selectors.
  // Resolved based on revision too.

  resolvedSelectors: computed(
    [state => state.selector.availableSelectors, state => state.currentRevisionId],
    (availableSelectors, currentRevisionId) => {
      const selectors = [];

      for (const selector of availableSelectors) {
        if (currentRevisionId && selector.revisedBy) {
          selectors.push(resolveSelector(selector, currentRevisionId));
        } else {
          selectors.push(selector);
        }
      }

      return selectors;
    }
  ),

  visibleCurrentLevelSelectors: computed(
    [
      state => state.resolvedSelectors,
      state => state.visibleCurrentLevelSelectorIds,
      state => state.selector.selectorPaths,
      state => state.revisionSubtreePath,
    ],
    (resolved, visibleCurrentLevelSelectorIds, selectorPaths, revisionSubtreePath) => {
      return visibleCurrentLevelSelectorIds
        .filter(id => selectorPaths[id] && selectorPaths[id].length !== revisionSubtreePath.length)
        .map(id => resolved.find(r => r.id === id))
        .filter(e => e) as BaseSelector[];
    }
  ),

  topLevelSelector: computed(
    [
      state => state.resolvedSelectors,
      state => state.visibleCurrentLevelSelectorIds,
      state => state.selector.selectorPaths,
      state => state.revisionSubtreePath,
    ],
    (resolved, visibleCurrentLevelSelectorIds, selectorPaths, revisionSubtreePath) => {
      const selector = visibleCurrentLevelSelectorIds.find(id => {
        return selectorPaths[id] && selectorPaths[id].length === revisionSubtreePath.length;
      });

      return resolved.find(r => r.id === selector);
    }
  ),

  visibleAdjacentSelectors: computed(
    [state => state.resolvedSelectors, state => state.visibleAdjacentSelectorIds],
    (resolved, visibleAdjacentSelectorIds) => {
      return visibleAdjacentSelectorIds.map(id => resolved.find(r => r.id === id)).filter(e => e) as BaseSelector[];
    }
  ),
};

export const hydrateRevisionStore = (data: any) => {
  return createStore(revisionStore, {
    enhancers: [batchedSubscribe(unstable_batchedUpdates)] as any,
    initialState: data,
  });
};

export const createRevisionStore = (initialData?: {
  captureModel: CaptureModel;
  initialRevision?: string;
  excludeStructures?: boolean;
}) => {
  const store = createStore(revisionStore, {
    enhancers: [batchedSubscribe(unstable_batchedUpdates)] as any,
  });

  if (initialData && initialData.captureModel) {
    store.getActions().setCaptureModel(initialData);
  }

  return store;
};
