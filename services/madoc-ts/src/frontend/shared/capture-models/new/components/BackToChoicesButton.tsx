import React, { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '../../editor/hooks/useNavigation';
import { Revisions } from '../../editor/stores/revisions/index';
import styled from 'styled-components';
import { CloseIcon } from '../../../icons/CloseIcon';

const ChoicesHeader = styled.div`
  padding: 0 1em;
  display: flex;
  margin-bottom: 1.3em;
`;

const ChoiceLabel = styled.h2`
  margin: 0;
  font-weight: 400;
`;

const ChoiceCloseButton = styled.button`
  background: #fff;
  border-radius: 50%;
  height: 2em;
  width: 2em;
  padding: 0;
  text-align: center;
  display: flex;
  border: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  &:hover {
    background: #f0f0f0;
  }
`;

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

  const backToChoices = useCallback(() => {
    if (idStack.length > 0 && currentRevisionId) {
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
    }
  }, [currentRevisionId, deselectRevision, idStack, pop, structureMap]);

  if (!currentRevisionId || willBeAutoNavigated || !showButton) {
    return null;
  }

  if (idStack.length > 0) {
    const current = structureMap[idStack[idStack.length - 1]];

    return (
      <ChoicesHeader>
        <ChoiceLabel title={t('Back to choices')} style={{ flex: 1 }}>
          {current?.structure.label && current?.structure.label !== 'Default' ? current?.structure.label : null}
        </ChoiceLabel>
        <ChoiceCloseButton onClick={backToChoices}>
          <CloseIcon />
        </ChoiceCloseButton>
      </ChoicesHeader>
    );
  }

  return null;
};
