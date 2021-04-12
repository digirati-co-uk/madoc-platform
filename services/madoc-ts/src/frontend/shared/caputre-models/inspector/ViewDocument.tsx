import { FieldPreview } from '@capture-models/editor';
import { filterRevises, isEntityList } from '@capture-models/helpers';
import { BaseField, CaptureModel } from '@capture-models/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { EmptyState } from '../../atoms/EmptyState';

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

  const filteredFields = filterRevises(fields) as BaseField[];

  // @todo filter revisions, but this time add the revisions to the fields

  return (
    <FieldPreviewWrapper>
      {filteredFields.map(field => (field.value ? <FieldPreview key={field.id} field={field} /> : null))}
    </FieldPreviewWrapper>
  );
};

const renderEntityList = (entities: CaptureModel['document'][], filterRevisions: string[] = []) => {
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
                const rendered = renderProperty(field, filterRevisions);
                if (!rendered) {
                  return null;
                }
                return <DocumentCollapse key={key}>{rendered}</DocumentCollapse>;
              })}
            </DocumentEntityList>
          </div>
        );
      })}
    </>
  );
};

const renderProperty = (fields: BaseField[] | CaptureModel['document'][], filterRevisions: string[] = []) => {
  const label = fields[0].label;
  const filteredFields = filterRevises(fields).filter(f => {
    return !f.revision || filterRevisions.indexOf(f.revision) === -1;
  });
  const description = fields[0].description;
  const renderedProperties = isEntityList(filteredFields)
    ? renderEntityList(filteredFields, filterRevisions)
    : renderFieldList(filteredFields as any);

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

export const ViewDocument: React.FC<{ document: CaptureModel['document']; filterRevisions?: string[] }> = ({
  document,
  filterRevisions = [],
}) => {
  const { t } = useTranslation();
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

  if (flatProperties.length === 0) {
    return <EmptyState>{t('No document yet')}</EmptyState>;
  }

  const rendered = flatProperties
    .map(([key, field]) => {
      return renderProperty(field, filterRevisions);
    })
    .filter(r => r !== null);

  if (rendered.length === 0) {
    return <EmptyState>{t('No document yet')}</EmptyState>;
  }

  return (
    <div style={{ padding: 20 }}>
      <h3>{document.label}</h3>
      <p>{document.description}</p>
      {rendered}
    </div>
  );
};
