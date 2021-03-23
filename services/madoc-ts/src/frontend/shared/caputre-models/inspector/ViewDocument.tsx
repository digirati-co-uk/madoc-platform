import { FieldPreview } from '@capture-models/editor';
import { isEntityList } from '@capture-models/helpers';
import { BaseField, CaptureModel } from '@capture-models/types';
import React from 'react';
import styled from 'styled-components';

const DocumentLabel = styled.div`
  font-size: 13px;
  font-weight: bold;
  color: #333;
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

const DocumentCollapse = styled.div`
  background: #fff;
  padding: 10px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  overflow-y: auto;
`;

const DocumentEntityList = styled.div`
  border-left: 1px solid #ddd;
  padding: 10px;
  background: #e9effc;
`;

const DocumentEntityLabel = styled.div`
  color: #111;
  font-weight: bold;
  font-size: 15px;
`;

const FieldPreviewWrapper = styled.div`
  white-space: pre-wrap;
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
    <FieldPreviewWrapper>
      {fields.map(field => (field.value ? <FieldPreview key={field.id} field={field} /> : null))}
    </FieldPreviewWrapper>
  );
};

const renderEntityList = (entities: CaptureModel['document'][]) => {
  return (
    <>
      {entities.map(entity => {
        const flatInnerProperties = Object.entries(entity.properties);
        return (
          <div key={entity.id}>
            {/*<div style={{ display: 'flex', marginBottom: 10 }}>*/}
            {/*  <div style={{ padding: '3px 16px' }}>{'v'}</div>*/}
            {/*  <DocumentEntityLabel>Some label</DocumentEntityLabel>*/}
            {/*</div>*/}
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
