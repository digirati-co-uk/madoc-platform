import * as React from 'react';
import { InternationalString } from '@iiif/presentation-3';
import {
  MetadataCard,
  MetadataCardItem,
  MetadataCardLabel,
  MetadataEmptyState,
} from '../../src/frontend/shared/atoms/MetadataConfiguration';
interface annotation {
  id: string;
  label: InternationalString;
  type: 'project' | 'capture-model' | 'external';
  count?: number;
}
export const AnnotationsPanel: React.FC<{ annotations?: annotation[] }> = ({ annotations }) => {
  if (!annotations || !annotations.length) {
    return <MetadataEmptyState>No Annotations</MetadataEmptyState>;
  }
  annotations.map(anno => {
    return (
      <MetadataCardItem key={anno.id}>
        <MetadataCard interactive>
          <MetadataCardLabel>{anno.label}</MetadataCardLabel>
        </MetadataCard>
      </MetadataCardItem>
    );
  });
};
