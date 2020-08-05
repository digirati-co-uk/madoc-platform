import { useRefinement } from '@capture-models/plugin-api';
import React from 'react';
import { FieldHeader, RoundedCard } from '@capture-models/editor';
import { BaseField, CaptureModel, FieldListRefinement } from '@capture-models/types';
import { isEntityList } from '@capture-models/helpers';
import { EntityInstanceList } from './EntityInstanceList';
import { FieldInstanceList } from './FieldInstanceList';

export const FieldList: React.FC<{
  entity: { property: string; instance: CaptureModel['document'] };
  chooseField: (field: { property: string; instance: BaseField }) => void;
  chooseEntity: (field: { property: string; instance: CaptureModel['document'] }) => void;
  path: Array<[string, string]>;
  hideCard?: boolean;
  readOnly?: boolean;
}> = ({ entity, chooseField, chooseEntity, path, readOnly, hideCard }) => {
  const refinement = useRefinement<FieldListRefinement>('field-list', entity, {
    path,
  });

  if (refinement) {
    return refinement.refine(entity, { path, chooseEntity, chooseField });
  }

  const content = (
    <>
      {Object.keys(entity.instance.properties).map((propertyId, idx) => {
        const instances = entity.instance.properties[propertyId];
        if (isEntityList(instances)) {
          const singleEntity = instances[0];
          return (
            <div key={idx}>
              <FieldHeader
                label={
                  instances.length > 1 && singleEntity.pluralLabel
                    ? singleEntity.pluralLabel
                    : singleEntity.label || 'Untitled'
                }
              />
              <EntityInstanceList
                path={path}
                entities={instances}
                property={propertyId}
                chooseEntity={chooseEntity}
                readOnly={readOnly}
              />
            </div>
          );
        }
        return (
          <FieldInstanceList
            key={idx}
            path={path}
            fields={instances}
            property={propertyId}
            chooseField={chooseField}
            readOnly={readOnly}
          />
        );
      })}
    </>
  );

  if (hideCard) {
    return content;
  }

  return <RoundedCard>{content}</RoundedCard>;
};
