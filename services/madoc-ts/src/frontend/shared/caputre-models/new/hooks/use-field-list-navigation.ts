import { Revisions } from '@capture-models/editor';
import { useMemo } from 'react';

export function useFieldListNavigation() {
  const { subtreePath, adjacent } = Revisions.useStoreState(s => ({
    adjacent: s.revisionAdjacentSubtreeFields,
    subtreePath: s.revisionSubtreePath,
  }));

  const { setPath } = Revisions.useStoreActions(a => ({
    setPath: a.revisionSetSubtree,
  }));

  const navigation = useMemo(() => {
    const currentNavItem = adjacent.currentId;
    let prev;
    let next;
    if (currentNavItem) {
      let breakNext = false;
      for (const field of adjacent.fields) {
        if (breakNext) {
          next = field;
          break;
        }
        if ((field as any).id === currentNavItem) {
          breakNext = true;
          continue;
        }
        prev = field;
      }
    }
    return { next, prev };
  }, [adjacent]);

  const goNext = useMemo(
    () =>
      navigation && navigation.next
        ? () => {
            setPath([...subtreePath.slice(0, -1), [subtreePath.slice(-1)[0][0], (navigation as any).next.id, false]]);
          }
        : undefined,
    [navigation, setPath, subtreePath]
  );

  const goPrev = useMemo(
    () =>
      navigation && navigation.prev
        ? () => {
            setPath([...subtreePath.slice(0, -1), [subtreePath.slice(-1)[0][0], (navigation as any).prev.id, false]]);
          }
        : undefined,
    [navigation, setPath, subtreePath]
  );

  return { navigation, goNext, goPrev };
}
