import { Revisions, useNavigation } from '@capture-models/editor';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonRow } from '../../../atoms/Button';

export const BackToChoicesButton: React.FC = () => {
  const { t } = useTranslation();
  const currentRevisionId = Revisions.useStoreState(s => s.currentRevisionId);
  const deselectRevision = Revisions.useStoreActions(a => a.deselectRevision);
  const [currentView, { pop, idStack }] = useNavigation();
  const structure = Revisions.useStoreState(s => s.structure);

  const willBeAutoNavigated = !structure || structure.type !== 'choice' || structure.items.length === 1;

  if (!currentRevisionId || willBeAutoNavigated) {
    return null;
  }

  if (idStack.length > 0) {
    return (
      <ButtonRow $noMargin style={{ padding: '0.5em' }}>
        <Button
          onClick={() => {
            for (let i = 0; i < idStack.length; i++) {
              pop();
            }
            deselectRevision({ revisionId: currentRevisionId });
          }}
        >
          {t('Back to choices')}
        </Button>
      </ButtonRow>
    );
  }

  return null;
};
