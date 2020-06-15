import React from 'react';
import { DocumentPreview, RoundedCard } from '@capture-models/editor';
import { isEntity } from '@capture-models/helpers';
import { useRefinement } from '@capture-models/plugin-api';
import { CaptureModel, EntityInstanceListRefinement } from '@capture-models/types';

// @todo use helpers function.
function getLabel(document: CaptureModel['document']) {
  if (
    document.labelledBy &&
    document.properties[document.labelledBy] &&
    document.properties[document.labelledBy].length > 0
  ) {
    const field = document.properties[document.labelledBy][0];
    if (!isEntity(field) && field.value) {
      return field.value;
    }
  }
  return `Field number (type: ${document.type})`;
}

export const EntityInstanceList: React.FC<{
  entities: Array<CaptureModel['document']>;
  property: string;
  path: Array<[string, string]>;
  chooseEntity: (field: { property: string; instance: CaptureModel['document'] }) => void;
  readOnly?: boolean;
}> = ({ entities, chooseEntity, property, path, readOnly }) => {
  const refinement = useRefinement<EntityInstanceListRefinement>(
    'entity-instance-list',
    { property, instance: entities },
    {
      path,
      readOnly,
    }
  );

  if (refinement) {
    return refinement.refine(
      { property, instance: entities },
      {
        path,
        chooseEntity,
        readOnly,
      }
    );
  }

  return (
    <>
      {entities.map((field, idx) => {
        return (
          <RoundedCard key={idx} interactive={true} onClick={() => chooseEntity({ instance: field, property })}>
            <DocumentPreview entity={field}>{getLabel(field)}</DocumentPreview>
          </RoundedCard>
        );
      })}
    </>
  );
};
