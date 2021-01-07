import { FieldPreview } from '@capture-models/editor';
import { isEntityList } from '@capture-models/helpers';
import { BaseField, CaptureModel } from '@capture-models/types';
import React from 'react';

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

  const renderFieldList = (fields: BaseField[]) => {
    if (!fields) {
      return null;
    }
    return (
      <div>
        {fields.map(field => (
          <div key={field.id}>
            <div>Id: {field.id}</div>
            <div>Revision: {field.revision}</div>
            <div>Revises: {field.revises}</div>
            <FieldPreview key={field.id} field={field} />
          </div>
        ))}
      </div>
    );
  };

  const renderEntityList = (entities: CaptureModel['document'][]) => {
    return (
      <div style={{ paddingLeft: 20 }}>
        {entities.map(entity => {
          const flatInnerProperties = Object.entries(entity.properties);
          return (
            <>
              {flatInnerProperties.map(([key, field]) => {
                // Label + description
                // Then value list.
                const label = field[0].label;
                const description = field[0].description;
                return (
                  <div key={key}>
                    <h4>{label}</h4>
                    <p>{description}</p>
                    {isEntityList(field) ? renderEntityList(field) : renderFieldList(field)}
                  </div>
                );
              })}
            </>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <h3>{document.label}</h3>
      <p>{document.description}</p>
      {flatProperties.map(([key, field]) => {
        // Label + description
        // Then value list.
        const label = field[0].label;
        const description = field[0].description;
        return (
          <div key={key}>
            <h4>{label}</h4>
            <p>{description}</p>
            {isEntityList(field) ? renderEntityList(field) : renderFieldList(field)}
          </div>
        );
      })}
    </div>
  );
};
