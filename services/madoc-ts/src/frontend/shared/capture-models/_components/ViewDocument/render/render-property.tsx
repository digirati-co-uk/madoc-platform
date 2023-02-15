import React from 'react';
import { isRef } from 'react-dnd/lib/utils/isRef';
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

  const arrFixed: Array<typeof fields[number]> = fields;
  const firstFilter = arrFixed.filter(item => filterRevisions.indexOf(item.revision ? item.revision : '') === -1);

  const filteredFields = filterRevises(firstFilter).filter(f => {
    if (highlightRevisionChanges) {
      const revised = f.type === 'entity' || (f.revision && f.revision === highlightRevisionChanges);
      if (!revised) {
        if (f.selector && f.selector.revisedBy) {
          for (const selector of f.selector.revisedBy) {
            if (!selector.revisionId || filterRevisions.indexOf(selector.revisionId) === -1) {
              return true;
            }
          }
        }
      }
      return revised;
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
    : renderFieldList(filteredFields as any, { fluidImage, tModel, revisionId: highlightRevisionChanges });

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
