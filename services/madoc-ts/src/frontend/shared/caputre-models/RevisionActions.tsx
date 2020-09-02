import { CardButton, CardButtonGroup, Revisions } from '@capture-models/editor';
import { isEntity } from '@capture-models/helpers';
import { BaseField, CaptureModel } from '@capture-models/types';
import React, { useCallback, useMemo } from 'react';

function isTopLevel(path: [string, string, boolean][]): boolean {
  return path.filter(p => !p[2]).length === 0;
}

function parseSubtree(subtree: [string, string, boolean][]) {
  const initial: { modelRoot: string[]; modelMapping: { [key: string]: string } } = {
    modelRoot: [],
    modelMapping: {},
  };
  return subtree.reduce((state, next) => {
    state.modelRoot.push(next[0]);
    state.modelMapping[next[0]] = next[1];
    return state;
  }, initial);
}

export const RevisionActions: React.FC<{ allowEdits?: boolean; readOnly?: boolean; allowNavigation?: boolean }> = ({
  allowEdits,
  readOnly,
  allowNavigation,
}) => {
  const { subtreePath, current, adjacent, currentEntity, currentField, currentRevisionId } = Revisions.useStoreState(
    s => ({
      current: s.currentRevision,
      adjacent: s.revisionAdjacentSubtreeFields,
      currentRevisionId: s.currentRevisionId,
      currentEntity: s.revisionSubtree,
      currentField: s.revisionSubtreeField,
      subtreePath: s.revisionSubtreePath,
    })
  );

  const {
    createRevision,
    deselectField,
    deselectRevision,
    popSubtree,
    setIsPreviewing,
    setPath,
  } = Revisions.useStoreActions(a => ({
    setPath: a.revisionSetSubtree,
    popSubtree: a.revisionPopSubtree,
    deselectField: a.revisionDeselectField,
    setIsPreviewing: a.setIsPreviewing,
    deselectRevision: a.deselectRevision,
    createRevision: a.createRevision,
  }));

  const isTop = isTopLevel(subtreePath);

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

  const field = currentField ? currentField : currentEntity && !isEntity(currentEntity) ? currentEntity : undefined;

  const goNext =
    navigation && navigation.next
      ? () => {
          setPath([...subtreePath.slice(0, -1), [subtreePath.slice(-1)[0][0], (navigation as any).next.id, false]]);
        }
      : undefined;

  const goPrev =
    navigation && navigation.prev
      ? () => {
          setPath([...subtreePath.slice(0, -1), [subtreePath.slice(-1)[0][0], (navigation as any).prev.id, false]]);
        }
      : undefined;

  const showSuggestEdit = allowEdits && readOnly;

  const suggestEditField = () => {
    if (!field || !currentRevisionId) {
      return; // should not be possible.
    }

    const { modelMapping, modelRoot } = parseSubtree(subtreePath);
    const fieldsToEdit = [field.id];

    createRevision({
      cloneMode: 'FORK_SOME_VALUES',
      revisionId: currentRevisionId,
      modelRoot,
      modelMapping,
      fieldsToEdit,
      readMode: false,
    });
  };
  const suggestEditEntity = () => {
    if (!currentRevisionId) {
      return; // error.
    }

    const { modelMapping, modelRoot } = parseSubtree(subtreePath);

    createRevision({
      cloneMode: 'FORK_LISTED_VALUES',
      revisionId: currentRevisionId,
      modelRoot,
      modelMapping,
      readMode: false,
    });
  };

  if (field) {
    return (
      <CardButtonGroup>
        <CardButton
          onClick={() => {
            if (currentField) {
              deselectField();
            } else {
              popSubtree(undefined);
            }
          }}
        >
          Go back
        </CardButton>
        {showSuggestEdit ? <CardButton onClick={suggestEditField}>Edit this {field.label}</CardButton> : null}
      </CardButtonGroup>
    );
  }

  if (currentEntity && !isTop) {
    return (
      <>
        {goNext || goPrev ? (
          <CardButtonGroup>
            <CardButton size="small" onClick={goPrev} disabled={!goPrev}>
              Previous {currentEntity.label}
            </CardButton>
            <CardButton size="small" onClick={goNext} disabled={!goNext}>
              Next {currentEntity.label}
            </CardButton>
          </CardButtonGroup>
        ) : null}
        <CardButtonGroup>
          <CardButton
            onClick={() => {
              popSubtree(undefined);
            }}
          >
            Go back
          </CardButton>
          {showSuggestEdit ? (
            <CardButton onClick={suggestEditEntity}>Edit this {currentEntity.label}</CardButton>
          ) : null}
        </CardButtonGroup>
      </>
    );
  }

  if (!current) return null;

  if (allowEdits) {
    return (
      <CardButtonGroup>
        {allowNavigation ? (
          <CardButton onClick={() => deselectRevision({ revisionId: current.revision.id })}>Go back</CardButton>
        ) : null}
        {readOnly ? (
          <CardButton
            onClick={() => createRevision({ revisionId: current.revision.id, cloneMode: 'FORK_LISTED_VALUES' })}
          >
            Suggest edit
          </CardButton>
        ) : (
          <CardButton onClick={() => setIsPreviewing(true)}>Publish</CardButton>
        )}
      </CardButtonGroup>
    );
  }

  if (allowNavigation) {
    return <CardButton onClick={() => deselectRevision({ revisionId: current.revision.id })}>Go back</CardButton>;
  }

  return null;
};
