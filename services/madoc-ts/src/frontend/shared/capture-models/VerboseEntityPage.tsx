import React, { useCallback } from 'react';
import { Revisions } from './editor/stores/revisions/index';
import { EntityTopLevel } from './EntityTopLevel';
import { isEntity } from './helpers/is-entity';
import { CaptureModel } from './types/capture-model';
import { BaseField } from './types/field-types';
import { VerboseFieldPage } from './VerboseFieldPage';

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
  allowEdits?: boolean;
  allowNavigation?: boolean;
}> = ({ readOnly, children, allowEdits, allowNavigation, ...props }) => {
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

  const field = currentField ? currentField : currentEntity && !isEntity(currentEntity) ? currentEntity : undefined;

  if (field) {
    return (
      <VerboseFieldPage
        key={field.id}
        readOnly={readOnly}
        allowEdits={allowEdits}
        allowNavigation={allowNavigation}
        field={{ property: fieldProperty || '', instance: field as BaseField }}
        path={subtreePath as any}
      />
    );
  }

  if (!currentEntity || !isEntity(currentEntity)) {
    throw new Error('Unknown currentEntity');
  }

  return (
    <EntityTopLevel
      key={currentEntity.id}
      setSelectedField={setSelectedField}
      setSelectedEntity={setSelectedEntity}
      path={subtreePath as any}
      readOnly={readOnly}
      allowEdits={allowEdits}
      allowNavigation={allowNavigation}
      entity={{ property: '', instance: currentEntity }}
      {...props}
    >
      {isTop ? children : null}
    </EntityTopLevel>
  );
};
