import React from 'react';
import { CardButton, CardButtonGroup } from '@capture-models/editor';
import { useRefinement } from '@capture-models/plugin-api';
import { BaseField, CaptureModel, EntityRefinement } from '@capture-models/types';
import { FieldList } from './FieldList';
import { VerboseSelector } from './VerboseSelector';
import { RevisionBreadcrumbs } from './RevisionBreadcrumbs';

export const EntityTopLevel: React.FC<{
  title?: string;
  description?: string;
  entity: { property: string; instance: CaptureModel['document'] };
  path: Array<[string, string]>;
  goBack?: () => void;
  goNext?: () => void;
  goPrev?: () => void;
  showNavigation?: boolean;
  readOnly?: boolean;
  setSelectedField: (field: { property: string; instance: BaseField }) => void;
  setSelectedEntity: (field: { property: string; instance: CaptureModel['document'] }) => void;
  staticBreadcrumbs?: string[];
  hideSplash?: boolean;
  hideCard?: boolean;
}> = ({
  title,
  description,
  entity,
  path,
  goBack,
  goNext,
  goPrev,
  showNavigation,
  staticBreadcrumbs,
  readOnly,
  setSelectedEntity,
  setSelectedField,
  hideSplash,
  hideCard,
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
        goBack,
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
      {showSelector && entity.instance.selector ? (
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
      {goNext || goPrev ? (
        <CardButtonGroup>
          <CardButton size="small" onClick={goPrev} disabled={!goPrev}>
            Previous {entity.instance.label}
          </CardButton>
          <CardButton size="small" onClick={goNext} disabled={!goNext}>
            Next {entity.instance.label}
          </CardButton>
        </CardButtonGroup>
      ) : null}
      {goBack ? <CardButton onClick={goBack}>{readOnly ? 'Go back' : 'Finish and save'}</CardButton> : null}
      {children}
    </>
  );
};
