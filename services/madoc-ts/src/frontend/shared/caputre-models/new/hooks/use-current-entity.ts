import { Revisions } from '@capture-models/editor';
import { isEntity } from '@capture-models/helpers';
import { BaseField, CaptureModel } from '@capture-models/types';
import { useCallback } from 'react';

function isTopLevel(path: [string, string, boolean][]): boolean {
  return path.filter(p => !p[2]).length === 0;
}

/**
 * Selects any field by ID
 *
 * - Correctly sets "skip" properties for breadcrumbs.
 * - Will recreate the path correctly
 * - a.revisionSetSubtree
 * - Should be used as the only way to change field.
 * - Only uses revisionSubtreePath and revisionSubtreeField and revisionSelectedFieldProperty
 * - Never sets the entity to be a field
 * - Add listener to correct fields that are added as entities.
 */
function useSelectField() {
  function selectField(id: string) {}

  return selectField;
}

/**
 * Creates a list of labels and handlers that you can use to reconstruct a path through the document.
 *
 * There will likely be a single component used for this.
 */
function useDocumentBreadcrumbs() {
  // All of the state that drives the current breadcrumbs.
}

/**
 * These are the specific components that will handled by this small stateful wrapper.
 *
 * There will be placeholder components that will read this config and display the configured items.
 *
 * <EditorSlots.InlineProperties property="some-property" />
 * <EditorSlots.InlineSelector />
 * <EditorSlots.InlineBreadcrumbs />
 * <EditorSlots.AdjacentNavigation />
 *
 * The implementation is free to not use this too, or provide other renderings before offering this as a
 * default choice. It will try to inline where possible.
 */
type RenderingConfig = {
  // Driven by hooks
  Breadcrumbs: any;
  SingleEntity: any;
  SingleField: any;
  AdjacentNavigation: any;

  // Driven by props
  ManagePropertyList: any; // Fallbacks passed in
  InlineField: any; // Fallbacks passed in
  InlineEntity: any; // Fallbacks passed in
  InlineSelector: any; // Fallbacks passed in
};

/**
 * Actions.
 *
 *
 * - Suggesting an edit field
 * - Suggest an edit entity
 * - Next adjacent entity
 * - Prev adjacent entity
 * - Back up a level in tree
 * - Publish / finish (out of scope now!)
 * - Deselecting revision (out of scope now!)
 */
function useInlineEditingActions() {
  // suggest edit for field
  // suggest edit for entity
  // create a new entity using current as a template
  // create a new blank entity from current
}

/**
 * Use Current entity.
 *
 * When a user selects something, they first select a subtree. This points to a field or an entity.
 * If that field points to an entity, one of the fields can be further focussed in.
 *
 * Either we are looking at an entity page with an optionally selected field, or a field page.
 */
export function useCurrentEntity() {
  const { currentEntity, currentFieldOnEntity, subtreePath, fieldProperty } = Revisions.useStoreState(s => {
    return {
      currentEntity: s.revisionSubtree,
      currentFieldOnEntity: s.revisionSubtreeField,
      subtreePath: s.revisionSubtreePath,
      fieldProperty: s.revisionSelectedFieldProperty,
    };
  });
  const { pushSubtree, popSubtree, selectField, deselectField } = Revisions.useStoreActions(a => {
    // a.rev

    return {
      pushSubtree: a.revisionPushSubtree,
      popSubtree: a.revisionPopSubtree,
      selectField: a.revisionSelectField,
      deselectField: a.revisionDeselectField,
    };
  });

  // Next / Previous

  if (!isEntity(currentEntity)) {
    throw new Error('Component called from context of a field (Revisions.revisionSubtree)');
  }

  const isTop = isTopLevel(subtreePath);

  const setFocusedField = useCallback(
    (field?: { property: string; id?: string; instance?: BaseField }) => {
      if (field) {
        const id = field.instance ? field.instance.id : field.id;
        if (id) {
          const toUpdate = { id: id, term: field.property };
          selectField(toUpdate);
        }
      } else {
        deselectField();
      }
    },
    [deselectField, selectField]
  );

  const setSelectedField = useCallback(
    (en?: { property: string; id?: string; instance?: CaptureModel['document'] }) => {
      if (en) {
        const id = en.instance ? en.instance.id : en.id;
        if (id) {
          const toUpdate = { id: id, term: en.property };
          pushSubtree(toUpdate);
        }
      } else {
        popSubtree(undefined);
      }
    },
    [popSubtree, pushSubtree]
  );

  return [
    currentEntity,
    {
      isTop,
      setSelectedField,
      setFocusedField,
      path: subtreePath,
      selectedField:
        currentFieldOnEntity && fieldProperty
          ? {
              instance: currentFieldOnEntity,
              property: fieldProperty,
            }
          : null,
    },
  ] as const;
}
