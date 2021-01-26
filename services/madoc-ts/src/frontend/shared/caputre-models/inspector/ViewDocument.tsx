import { FieldPreview } from '@capture-models/editor';
import { isEntityList } from '@capture-models/helpers';
import { BaseField, CaptureModel } from '@capture-models/types';
import React from 'react';
import styled from 'styled-components';

const DocumentLabel = styled.div`
  font-size: 13px;
  font-weight: bold;
  color: #4676d6;
`;

const DocumentDescription = styled.div`
  font-size: 11px;
  color: #999;
`;

const DocumentHeading = styled.div`
  margin-bottom: 0.5em;
`;

const DocumentValueWrapper = styled.div`
  //background: palegoldenrod;
`;

const DocumentSection = styled.div`
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
  margin-bottom: 20px;
`;

const DocumentCollapse = styled.div``;

const DocumentEntityList = styled.div`
  border-left: 1px solid #ddd;
  margin-left: 20px;
  padding-left: 20px;
  &:hover {
    background: #eee;
  }
  &:hover &:hover {
    background: #ddd;
  }
`;

const DocumentEntityLabel = styled.div`
  color: #111;
  font-weight: bold;
  font-size: 15px;
`;

const isEmptyFieldList = (fields: BaseField[]) => {
  for (const field of fields) {
    if (field.value) {
      return false;
    }
  }
  return true;
};

const renderFieldList = (fields: BaseField[]) => {
  if (!fields || isEmptyFieldList(fields)) {
    return null;
  }

  // @todo filter revisions, but this time add the revisions to the fields

  return (
    <div>
      {fields.map(field =>
        field.value ? (
          <div key={field.id}>
            {/*<div>Id: {field.id}</div>*/}
            {/*<div>Revision: {field.revision}</div>*/}
            {/*<div>Revises: {field.revises}</div>*/}
            <FieldPreview key={field.id} field={field} />
          </div>
        ) : null
      )}
    </div>
  );
};

const renderEntityList = (entities: CaptureModel['document'][]) => {
  return (
    <>
      {entities.map(entity => {
        const flatInnerProperties = Object.entries(entity.properties);
        return (
          <div>
            <div style={{ display: 'flex', marginBottom: 10 }}>
              <div style={{ padding: '3px 16px' }}>{'v'}</div>
              <DocumentEntityLabel>Some label</DocumentEntityLabel>
            </div>
            <DocumentEntityList>
              {flatInnerProperties.map(([key, field]) => {
                // eslint-disable-next-line
              return <DocumentCollapse key={key}>{renderProperty(field)}</DocumentCollapse>;
              })}
            </DocumentEntityList>
          </div>
        );
      })}
    </>
  );
};

const renderProperty = (fields: BaseField[] | CaptureModel['document'][]) => {
  const label = fields[0].label;
  const description = fields[0].description;
  const renderedProperties = isEntityList(fields) ? renderEntityList(fields) : renderFieldList(fields);

  if (!renderedProperties) {
    return null;
  }

  return (
    <DocumentSection>
      <DocumentHeading>
        <DocumentLabel>{label}</DocumentLabel>
        {description ? <DocumentDescription>{description}</DocumentDescription> : null}
      </DocumentHeading>
      <DocumentValueWrapper>{renderedProperties}</DocumentValueWrapper>
    </DocumentSection>
  );
};

export const ViewDocument: React.FC<{ document: CaptureModel['document'] }> = ({ document }) => {
  // ✅ Label (plural label / labelled by)
  // ✅ Description
  // -  Profile
  // -  Revision
  // -  Selector
  // -  Revises
  // -  Data sources
  // -  allow multiple

  // Properties

  // Property
  // Hide if empty value (not property)
  // If no non-empty property then show empty state
  // If a field or entity is revised by another, show it grayed out
  // - Click to highlight all of the same revision
  // - Click to also highlight the revises property (can we draw a line?)
  // - Click to highlight which field revises it.
  // Option to only show canonical document.
  // Add show history on field
  //  - Traverses up the revises field
  //  - Shows it in a list

  const flatProperties = Object.entries(document.properties);

  return (
    <div style={{ padding: 20 }}>
      <h3>{document.label}</h3>
      <p>{document.description}</p>
      {flatProperties.map(([key, field]) => {
        return <React.Fragment key={key}>{renderProperty(field)}</React.Fragment>;
      })}
    </div>
  );
};
