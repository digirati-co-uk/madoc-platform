import { useImageService } from 'react-iiif-vault';
import { ImageService } from '@iiif/presentation-3';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../layout/EmptyState';
import { useModelTranslation } from '../hooks/use-model-translation';
import { CaptureModel } from '../types/capture-model';
import { renderProperty } from '../_components/ViewDocument/render/render-property';

export const ViewDocument: React.FC<{
  document: CaptureModel['document'] | Array<CaptureModel['document']>;
  filterRevisions?: string[];
  hideTitle?: boolean;
  padding?: boolean;
  collapsed?: boolean;
  fluidImage?: boolean;
  highlightRevisionChanges?: string;
  hideEmpty?: boolean;
}> = ({
  document: documentOrArray,
  filterRevisions = [],
  hideTitle,
  hideEmpty,
  padding = true,
  highlightRevisionChanges,
  collapsed,
  fluidImage,
}) => {
  const { t: tModel } = useModelTranslation();
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
  const documentList = Array.isArray(documentOrArray) ? documentOrArray : [documentOrArray];
  const renderedList: any[] = [];

  for (const document of documentList) {
    const flatProperties = Object.entries(document.properties);

    if (flatProperties.length === 0) {
      continue;
    }

    const rendered = flatProperties
      .map(([, field], key) => {
        return renderProperty(field, { key: key, filterRevisions, highlightRevisionChanges, fluidImage, tModel });
      })
      .filter(r => r !== null);

    if (rendered.length) {
      renderedList.push({
        label: tModel(document.label),
        description: document.description ? tModel(document.description) : undefined,
        rendered,
      });
    }
  }

  if (hideEmpty && renderedList.length === 0) {
    return null;
  }

  if (renderedList.length === 0) {
    return <EmptyState>{t('No document yet')}</EmptyState>;
  }

  return (
    <div style={{ padding: padding ? 20 : 0 }}>
      {renderedList.map(({ label, description, rendered }, n) => (
        <React.Fragment key={n}>
          {!hideTitle ? <h3 style={{ margin: 0, color: '#5066DD', fontWeight: 500 }}>{tModel(label)}</h3> : null}
          {!hideTitle ? <p>{description ? tModel(description) : ''}</p> : null}
          {rendered}
        </React.Fragment>
      ))}
    </div>
  );
};
