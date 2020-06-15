import { CardButton, CardButtonGroup, Revisions } from '@capture-models/editor';
import { RevisionRequest } from '@capture-models/types';
import React, { useCallback, useState } from 'react';
import { VerboseEntityPage } from './VerboseEntityPage';
import { RevisionPreview } from './RevisionPreview';
import { ThankYouPage } from './ThankYouPage';

export const RevisionTopLevel: React.FC<{
  readOnly: boolean;
  instructions?: string;
  onSaveRevision: (req: RevisionRequest, status?: string) => Promise<void>;
}> = ({ readOnly, instructions, onSaveRevision }) => {
  const current = Revisions.useStoreState(s => s.currentRevision);
  const deselectRevision = Revisions.useStoreActions(s => s.deselectRevision);
  const createRevision = Revisions.useStoreActions(a => a.createRevision);
  const setRevisionLabel = Revisions.useStoreActions(a => a.setRevisionLabel);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isThankYou, setIsThankYou] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const setDescriptionOfChange = useCallback(label => setRevisionLabel({ label }), [setRevisionLabel]);

  if (!current) return null;

  if (isThankYou) {
    return <ThankYouPage onContinue={() => deselectRevision({ revisionId: current.revision.id })} />;
  }

  if (isPreviewing) {
    return (
      <RevisionPreview
        isSaving={isSaving}
        error={error}
        descriptionOfChange={current.revision.label || current.document.label || ''}
        setDescriptionOfChange={setDescriptionOfChange}
        entity={{ property: 'root', instance: current.document }}
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
              setIsThankYou(true);
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
        title={current.revision.label}
        description={instructions}
        entity={{ property: 'root', instance: current.document }}
        path={[]}
        readOnly={readOnly}
      >
        <CardButtonGroup>
          <CardButton onClick={() => deselectRevision({ revisionId: current.revision.id })}>Go back</CardButton>
          {readOnly ? (
            <CardButton
              onClick={() => createRevision({ revisionId: current.revision.id, cloneMode: 'FORK_ALL_VALUES' })}
            >
              Suggest edit
            </CardButton>
          ) : (
            <CardButton onClick={() => setIsPreviewing(true)}>Publish</CardButton>
          )}
        </CardButtonGroup>
      </VerboseEntityPage>
    </>
  );
};
