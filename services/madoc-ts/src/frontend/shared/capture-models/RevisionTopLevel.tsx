import React, { useCallback, useState } from 'react';
import { Revisions } from './editor/stores/revisions/index';
import { RevisionRequest } from './types/revision-request';
import { VerboseEntityPage } from './VerboseEntityPage';
import { RevisionPreview } from './RevisionPreview';
import { ThankYouPage } from './ThankYouPage';

export const RevisionTopLevel: React.FC<{
  readOnly: boolean;
  allowEdits?: boolean;
  allowNavigation?: boolean;
  skipThankYou?: boolean;
  skipPreview?: boolean;
  instructions?: string;
  onSaveRevision: (req: RevisionRequest, status?: string) => Promise<void>;
}> = ({
  readOnly,
  instructions,
  onSaveRevision,
  skipThankYou,
  skipPreview,
  allowEdits = true,
  allowNavigation = true,
}) => {
  const { setIsThankYou, setIsPreviewing, deselectRevision, setRevisionLabel } = Revisions.useStoreActions(actions => {
    return {
      setIsThankYou: actions.setIsThankYou,
      setIsPreviewing: actions.setIsPreviewing,
      deselectRevision: actions.deselectRevision,
      createRevision: actions.createRevision,
      setRevisionLabel: actions.setRevisionLabel,
    };
  });
  const { isThankYou, isPreviewing, current } = Revisions.useStoreState(state => {
    return {
      current: state.currentRevision,
      isPreviewing: state.isPreviewing,
      isThankYou: state.isThankYou,
    };
  });

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const setDescriptionOfChange = useCallback(label => setRevisionLabel({ label }), [setRevisionLabel]);

  if (!current) return null;

  if (isThankYou) {
    return (
      <ThankYouPage
        onContinue={() => {
          if (allowNavigation) {
            deselectRevision({ revisionId: current.revision.id });
          }
          setIsThankYou(false);
        }}
      />
    );
  }

  if (isPreviewing) {
    return (
      <RevisionPreview
        key={current.revision.id}
        isSaving={isSaving}
        error={error}
        descriptionOfChange={current.revision.label || current.document.label || ''}
        setDescriptionOfChange={setDescriptionOfChange}
        onEdit={() => setIsPreviewing(false)}
        onSave={() => {
          setError('');
          setIsSaving(true);
          onSaveRevision(current, 'draft')
            .then(() => {
              setIsSaving(false);
              deselectRevision({ revisionId: current.revision.id });
            })
            .catch(() => {
              setIsSaving(false);
              setError('We could not save your model');
            });
        }}
        onPublish={() => {
          setError('');
          setIsSaving(true);
          onSaveRevision(current, 'submitted')
            .then(() => {
              setIsSaving(false);
              if (skipThankYou) {
                deselectRevision({ revisionId: current.revision.id });
              } else {
                setIsThankYou(true);
              }
            })
            .catch(() => {
              setIsSaving(false);
              setError('We could not save your model');
            });
        }}
      />
    );
  }

  return (
    <>
      <VerboseEntityPage
        key={current.revision.id}
        title={current.revision.label}
        description={instructions}
        readOnly={readOnly}
        allowEdits={allowEdits}
        allowNavigation={allowNavigation}
      />
    </>
  );
};
