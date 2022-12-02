import React from 'react';
import { filterRevises } from '../../../helpers/filter-revises';
import { isEntityList } from '../../../helpers/is-entity';
import { CaptureModel } from '../../../types/capture-model';
import { BaseField } from '../../../types/field-types';
import { ViewProperty } from '../components/ViewProperty';
import { renderEntityList } from './render-entity-list';
import { renderFieldList } from './render-field-list';

export const renderProperty = (
  fields: BaseField[] | CaptureModel['document'][],
  {
    key,
    filterRevisions = [],
    collapsed,
    collapsedEntity,
    highlightRevisionChanges,
    fluidImage,
    tModel,
  }: {
    key: any;
    filterRevisions?: string[];
    highlightRevisionChanges?: string;
    collapsed?: boolean;
    collapsedEntity?: boolean;
    fluidImage?: boolean;
    tModel: (s: string) => string;
  }
) => {
  const label =
    fields.length > 1 && fields[0] && fields[0].pluralLabel ? fields[0].pluralLabel : fields[0] ? fields[0].label : '';
  const filteredFields = filterRevises(fields).filter(f => {
    if (highlightRevisionChanges) {
      return f.type === 'entity' || (f.revision && f.revision === highlightRevisionChanges);
    }

    return !f.revision || filterRevisions.indexOf(f.revision) === -1;
  });
  const description = fields[0]?.description;
  const renderedProperties = isEntityList(filteredFields)
    ? renderEntityList(filteredFields, {
        filterRevisions,
        highlightRevisionChanges,
        collapsedEntity,
        fluidImage,
        tModel,
      })
    : renderFieldList(filteredFields as any, { fluidImage, tModel });

  if (!renderedProperties) {
    return null;
  }

  return (
    <ViewProperty
      key={key}
      label={label ? tModel(label) : ''}
      description={description ? tModel(description) : ''}
      collapsed={collapsed}
      interactive={isEntityList(filteredFields)}
    >
      {renderedProperties}
    </ViewProperty>
  );
};
