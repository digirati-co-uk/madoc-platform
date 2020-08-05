import React from 'react';
import styled from 'styled-components';
import { Revisions } from '@capture-models/editor';

const HeaderBackground = styled.div`
  background: #333;
  padding: 1em;
  color: #fff;
`;

export const CaptureModelHeader: React.FC = () => {
  const currentRevision = Revisions.useStoreState(s => s.currentRevision);
  const { currentEntity, currentField, subtreePath, isThankYou, isPreviewing } = Revisions.useStoreState(s => ({
    currentEntity: s.revisionSubtree,
    currentField: s.revisionSubtreeField,
    subtreePath: s.revisionSubtreePath,
    isPreviewing: s.isPreviewing,
    isThankYou: s.isThankYou,
  }));
  const currentStructure = Revisions.useStoreState(s => s.currentStructure);

  if (isThankYou) {
    return <HeaderBackground>Thank you</HeaderBackground>;
  }

  if (isPreviewing) {
    return <HeaderBackground>Summary of your submission</HeaderBackground>;
  }

  // First big split, are we in a revision or in the navigation?
  if (currentRevision) {
    if (subtreePath.length === 0) {
      return (
        <HeaderBackground>
          <strong>{currentRevision.revision.label}</strong>
        </HeaderBackground>
      );
    }

    if (currentField) {
      return (
        <HeaderBackground>
          <strong>{currentRevision.revision.label}</strong> - {currentField.label}
        </HeaderBackground>
      );
    }
    if (currentEntity) {
      return (
        <HeaderBackground>
          <strong>{currentRevision.revision.label}</strong> - {currentEntity.label}
        </HeaderBackground>
      );
    }
    // Unknown if we can get here.
    return (
      <HeaderBackground>
        <strong>{currentRevision.revision.label}</strong>
      </HeaderBackground>
    );
  } else if (currentStructure) {
    // In the navigation.
    return <HeaderBackground>{currentStructure.label}</HeaderBackground>;
  }

  return <HeaderBackground>...</HeaderBackground>;
};
