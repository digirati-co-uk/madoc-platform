import * as React from 'react';
import { LocaleString } from '../../src';
import { MetadataItem } from '@iiif/presentation-3';
import { MetadataEmptyState } from '../../src/frontend/shared/atoms/MetadataConfiguration';

export const MetadataPanel: React.FC<{ metadata?: MetadataItem[] }> = ({ metadata }) => {
  if (!metadata || !metadata.length) {
    return <MetadataEmptyState>No Metadata</MetadataEmptyState>;
  }
  metadata.map(data => {
    return (
      <>
        <LocaleString>{data.label}</LocaleString>
        <LocaleString>{data.value}</LocaleString>
      </>
    );
  });
};
