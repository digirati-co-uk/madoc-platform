import { useMemo } from 'react';
import { useUser } from '../../../hooks/use-site';
import { filterUserRevisions, revisionsMapToRevisionsList } from '../../new/hooks/use-revision-list';
import { RevisionRequest } from '../../types/revision-request';
import { Revisions } from '../stores/revisions/index';

export function useNavigation() {
  const user = useUser();
  const { currentStructure, currentId, structureMap, idStack, choiceStack, allRevisions } = Revisions.useStoreState(
    state => {
      return {
        currentStructure: state.currentStructure,
        currentId: state.currentStructureId,
        idStack: state.idStack,
        structureMap: state.structureMap,
        choiceStack: state.choiceStack,
        allRevisions: state.revisions,
      };
    }
  );

  const { goTo, pop, push } = Revisions.useStoreActions(actions => {
    return {
      goTo: actions.goToStructure,
      push: actions.pushStructure,
      pop: actions.popStructure,
    };
  });

  const revisions = useMemo(() => {
    const allUser = filterUserRevisions(revisionsMapToRevisionsList(allRevisions), user);
    const toReturn: Record<string, RevisionRequest[]> = {};

    if (currentStructure?.type === 'choice') {
      for (const item of currentStructure.items) {
        toReturn[item.id] = allUser.filter(s => {
          return s.revision.structureId === item.id;
        });
      }
    }

    return toReturn;
  }, [allRevisions, user, currentStructure]);

  return [
    currentStructure,
    {
      currentId,
      goTo,
      push,
      pop,
      idStack,
      choiceStack,
      structureMap,
      revisions,
    },
  ] as const;
}
