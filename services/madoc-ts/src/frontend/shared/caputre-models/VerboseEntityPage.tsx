import { BaseField, CaptureModel } from '@capture-models/types';
import React, { useCallback, useMemo } from 'react';
import { EntityTopLevel } from './EntityTopLevel';
import { VerboseFieldPage } from './VerboseFieldPage';
import { Revisions } from '@capture-models/editor';

function isTopLevel(path: [string, string, boolean][]): boolean {
  return path.filter(p => !p[2]).length === 0;
}

export const VerboseEntityPage: React.FC<{
  title?: string;
  description?: string;
  showNavigation?: boolean;
  readOnly?: boolean;
  staticBreadcrumbs?: string[];
  hideSplash?: boolean;
  hideCard?: boolean;
}> = ({ readOnly, children, ...props }) => {
  const adjacent = Revisions.useStoreState(s => s.revisionAdjacentSubtreeFields);

  const { currentEntity, currentField, subtreePath, fieldProperty } = Revisions.useStoreState(s => {
    return {
      currentEntity: s.revisionSubtree,
      currentField: s.revisionSubtreeField,
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
  const setPath = Revisions.useStoreActions(a => a.revisionSetSubtree);

  const isTop = isTopLevel(subtreePath);

  const setSelectedField = useCallback(
    (field?: { property: string; instance: BaseField }) => {
      if (field) {
        const toUpdate = { id: field.instance.id, term: field.property };
        selectField(toUpdate);
      } else {
        deselectField();
      }
    },
    [deselectField, selectField]
  );

  const setSelectedEntity = useCallback(
    (en?: { property: string; instance: CaptureModel['document'] }) => {
      if (en) {
        const toUpdate = { id: en.instance.id, term: en.property };
        pushSubtree(toUpdate);
      } else {
        popSubtree(undefined);
      }
    },
    [popSubtree, pushSubtree]
  );

  const navigation = useMemo(() => {
    const current = adjacent.currentId;
    let prev;
    let next;
    if (current) {
      let breakNext = false;
      for (const field of adjacent.fields) {
        if (breakNext) {
          next = field;
          break;
        }
        if ((field as any).id === current) {
          breakNext = true;
          continue;
        }
        prev = field;
      }
    }
    return { next, prev };
  }, [adjacent]);

  if (currentField) {
    return (
      <VerboseFieldPage
        key={currentField.id}
        readOnly={readOnly}
        field={{ property: fieldProperty || '', instance: currentField as BaseField }}
        path={subtreePath as any}
        goBack={() => {
          setSelectedField(undefined);
        }}
      />
    );
  }

  if (!currentEntity) {
    throw new Error('Unknown currentEntity');
  }

  return (
    <EntityTopLevel
      key={currentEntity.id}
      setSelectedField={setSelectedField}
      setSelectedEntity={setSelectedEntity}
      path={subtreePath as any}
      readOnly={readOnly}
      entity={{ property: '', instance: currentEntity }}
      goBack={
        isTop
          ? undefined
          : () => {
              setSelectedEntity(undefined);
            }
      }
      goNext={
        navigation && navigation.next
          ? () => {
              setPath([...subtreePath.slice(0, -1), [subtreePath.slice(-1)[0][0], (navigation as any).next.id, false]]);
            }
          : undefined
      }
      goPrev={
        navigation && navigation.prev
          ? () => {
              setPath([...subtreePath.slice(0, -1), [subtreePath.slice(-1)[0][0], (navigation as any).prev.id, false]]);
            }
          : undefined
      }
      {...props}
    >
      {isTop ? children : null}
    </EntityTopLevel>
  );
};
