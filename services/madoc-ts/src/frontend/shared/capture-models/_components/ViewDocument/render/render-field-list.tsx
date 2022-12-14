import React from 'react';
import { FieldPreview } from '../../../editor/components/FieldPreview/FieldPreview';
import { filterRevises } from '../../../helpers/filter-revises';
import { BaseField } from '../../../types/field-types';
import { isEmptyFieldList } from '../../../utility/is-field-list-empty';
import { ViewField } from '../components/ViewField';
import { FieldPreviewWrapper } from '../ViewDocument.styles';

export const renderFieldList = (
  fields: BaseField[],
  { fluidImage }: { fluidImage?: boolean; tModel: (s: string) => string }
) => {
  if (!fields || isEmptyFieldList(fields)) {
    return null;
  }

  const filteredFields = (filterRevises(fields) as BaseField[]).filter(r => {
    return r.value || r.selector;
  });

  if (filteredFields.length === 0) {
    return null;
  }

  return (
    <FieldPreviewWrapper>
      {filteredFields.map(field => (
        <ViewField key={field.id} field={field} fluidImage={fluidImage} />
      ))}
    </FieldPreviewWrapper>
  );
};
