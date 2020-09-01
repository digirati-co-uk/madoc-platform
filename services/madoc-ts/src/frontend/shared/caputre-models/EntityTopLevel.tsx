import React from 'react';
import { useRefinement } from '@capture-models/plugin-api';
import { BaseField, CaptureModel, EntityRefinement } from '@capture-models/types';
import { FieldList } from './FieldList';
import { RevisionActions } from './RevisionActions';
import { VerboseSelector } from './VerboseSelector';
import { RevisionBreadcrumbs } from './RevisionBreadcrumbs';

export const EntityTopLevel: React.FC<{
  title?: string;
  description?: string;
  entity: { property: string; instance: CaptureModel['document'] };
  path: Array<[string, string]>;
  showNavigation?: boolean;
  readOnly?: boolean;
  setSelectedField: (field: { property: string; instance: BaseField }) => void;
  setSelectedEntity: (field: { property: string; instance: CaptureModel['document'] }) => void;
  staticBreadcrumbs?: string[];
  hideSplash?: boolean;
  hideCard?: boolean;
  allowEdits?: boolean;
  allowNavigation?: boolean;
}> = ({
  entity,
  path,
  showNavigation,
  staticBreadcrumbs,
  readOnly,
  setSelectedEntity,
  setSelectedField,
  hideSplash,
  hideCard,
  allowNavigation,
  allowEdits,
  children,
}) => {
  const refinement = useRefinement<EntityRefinement>('entity', entity, {
    path,
    staticBreadcrumbs,
    readOnly,
  });

  if (refinement) {
    return refinement.refine(
      entity,
      {
        path,
        showNavigation,
        staticBreadcrumbs,
        readOnly,
        hideSplash,
        hideCard,
      },
      children
    );
  }

  const showSelector = entity.instance.selector && (path.length !== 0 || entity.instance.selector.state);

  const body = (
    <>
      <RevisionBreadcrumbs />
      {showSelector && entity.instance.selector && !entity.instance.immutable ? (
        <VerboseSelector
          isTopLevel={path.length === 0}
          readOnly={readOnly || path.length === 0}
          selector={entity.instance.selector}
        />
      ) : null}
      <FieldList
        path={path}
        entity={entity}
        chooseEntity={setSelectedEntity}
        chooseField={setSelectedField}
        readOnly={readOnly}
        hideCard={hideCard}
      />
    </>
  );

  if (hideSplash) {
    return body;
  }

  return (
    <>
      {body}
      <RevisionActions readOnly={readOnly} allowNavigation={allowNavigation} allowEdits={allowEdits} />
      {children}
    </>
  );
};
