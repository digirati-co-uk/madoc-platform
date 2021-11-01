import { Revisions, useNavigation } from '@capture-models/editor';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonRow } from '../../../navigation/Button';

export const BackToChoicesButton: React.FC = () => {
  const { t } = useTranslation();
  const currentRevisionId = Revisions.useStoreState(s => s.currentRevisionId);
  const revisionSubtreePath = Revisions.useStoreState(s => s.revisionSubtreePath);
  const deselectRevision = Revisions.useStoreActions(a => a.deselectRevision);
  const [, { pop, idStack, structureMap }] = useNavigation();
  const structure = Revisions.useStoreState(s => s.structure);

  const willBeAutoNavigated = !structure || structure.type !== 'choice' || structure.items.length === 1;

  const showButton = useMemo(() => {
    for (const [, , skip] of revisionSubtreePath || []) {
      if (skip) continue;
      return false;
    }

    return true;
  }, [revisionSubtreePath]);

  if (!currentRevisionId || willBeAutoNavigated || !showButton) {
    return null;
  }

  if (idStack.length > 0) {
    return (
      <ButtonRow $noMargin style={{ padding: '0 0.8em', marginBottom: '1em' }}>
        <Button
          onClick={() => {
            let nextId: any;
            const stack = [...idStack];
            while ((nextId = stack.pop())) {
              const next = structureMap[nextId];
              if (next && next.structure && next.structure.type === 'choice' && next.structure.items.length !== 1) {
                break;
              }
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
