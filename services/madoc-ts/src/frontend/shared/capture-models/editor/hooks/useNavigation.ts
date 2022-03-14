import { Revisions } from '../stores/revisions/index';

export function useNavigation() {
  const { currentStructure, currentId, structureMap, idStack, choiceStack } = Revisions.useStoreState(state => {
    return {
      currentStructure: state.currentStructure,
      currentId: state.currentStructureId,
      idStack: state.idStack,
      structureMap: state.structureMap,
      choiceStack: state.choiceStack,
    };
  });

  const { goTo, pop, push } = Revisions.useStoreActions(actions => {
    return {
      goTo: actions.goToStructure,
      push: actions.pushStructure,
      pop: actions.popStructure,
    };
  });

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
    },
  ] as const;
}
