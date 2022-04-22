import React, { useCallback, useContext, useRef } from 'react';
import { AnnotationBuckets } from '../../../../../../types/annotation-styles';
import { isEntity, isEntityList } from '../../../helpers/is-entity';
import { PluginContext } from '../../../plugin-api/context';
import { useSelector } from '../../../plugin-api/hooks/use-selector';
import { useSelectors } from '../../../plugin-api/hooks/use-selectors';
import { BaseField } from '../../../types/field-types';
import { BaseSelector } from '../../../types/selector-types';
import { Revisions } from '../revisions';
import { useDebouncedCallback } from 'use-debounce';
import { unstable_batchedUpdates } from 'react-dom';

export function useFieldSelector(field: BaseField) {
  return Revisions.useStoreState(s =>
    field.selector
      ? s.resolvedSelectors.find(({ id }) => (field.selector ? id === field.selector.id : false))
      : undefined
  );
}

export function useSelectorWithId(targetId: string) {
  return Revisions.useStoreState(s => (targetId ? s.resolvedSelectors.find(({ id }) => id === targetId) : undefined));
}

export function useSelectorActions() {
  return [
    Revisions.useStoreActions(s => ({
      addVisibleSelectorIds: s.addVisibleSelectorIds,
      removeVisibleSelectorIds: s.removeVisibleSelectorIds,
      updateSelectorPreview: s.updateSelectorPreview,
      chooseSelector: s.chooseSelector,
      clearSelector: s.clearSelector,
    })),
    Revisions.useStoreState(s => s.resolvedSelectors),
  ] as const;
}

export function useSelectorHandlers() {
  const updateSelectorPreviewQueue = useRef<any[]>([]);

  const visibleSelectors = Revisions.useStoreState(state => {
    return {
      current: state.selector.currentSelectorId,
      currentLevel: state.visibleCurrentLevelSelectorIds,
      adjacent: state.visibleAdjacentSelectorIds,
      topLevel: state.topLevelSelector?.id,
    };
  });

  const { paths, subtreePath, currentSubtree } = Revisions.useStoreState(s => ({
    currentSubtree: s.revisionSubtree,
    paths: s.selector.selectorPaths,
    subtreePath: s.revisionSubtreePath,
  }));

  const { pop, push, setPath, realUpdateSelectorPreview } = Revisions.useStoreActions(a => ({
    pop: a.revisionPopTo,
    push: a.revisionPushSubtree,
    setPath: a.revisionSetSubtree,
    realUpdateSelectorPreview: a.updateSelectorPreview,
  }));

  const [flushSelectors] = useDebouncedCallback(
    () => {
      const queue = updateSelectorPreviewQueue.current;
      if (!queue.length) {
        return;
      }
      unstable_batchedUpdates(() => {
        for (const action of queue) {
          realUpdateSelectorPreview(action);
        }
      });
      updateSelectorPreviewQueue.current = [];
    },
    200,
    { maxWait: 200, trailing: true }
  );

  const updateSelectorPreview = useCallback(
    (action: any) => {
      updateSelectorPreviewQueue.current.push(action);
      flushSelectors();
    },
    [flushSelectors]
  );

  const onClickDisplaySelector = useCallback(
    (s: BaseSelector) => {
      // Disable display level selector for now.
      if (true as boolean) {
        return;
      }

      const id = s.id;
      const path = paths[id];
      if (!path) {
        return;
      }

      if (currentSubtree && isEntity(currentSubtree)) {
        const [property, fieldId] = path[path.length - 1];

        const chosenPath = currentSubtree.properties[property];
        if (!chosenPath || !isEntityList(chosenPath)) {
          return;
        }

        push({ term: property, id: fieldId });
      }
    },
    [currentSubtree, push, paths]
  );

  const onClickTopLevelSelector = useCallback(
    (s: BaseSelector) => {
      // Disable top level selector for now.
      if (true as boolean) {
        return;
      }
      // @todo make this "popTo" and get the id from the selector.
      const id = s.id;
      const path = paths[id];
      if (!path) {
        return;
      }

      const [, fieldId] = path[path.length - 1];

      pop({ id: fieldId });
    },
    [paths, pop]
  );

  const onClickAdjacentSelector = useCallback(
    (s: BaseSelector) => {
      // Disable adjacent selector.
      if (true as boolean) {
        return;
      }

      const id = s.id;
      const path = paths[id];
      if (!path) {
        return;
      }

      // @todo this might need to be more complex if we are to support skipping in adjacency
      const [property, fieldId] = path[path.length - 1];
      // const newPath = [...path.slice(0, -1), [property, fieldId]]
      const [currentProp, currentFieldId] = subtreePath[subtreePath.length - 1];

      if (property === currentProp && fieldId !== currentFieldId) {
        setPath([...subtreePath.slice(0, -1), [property, fieldId, false]]);
      }
    },
    [paths, setPath, subtreePath]
  );

  return {
    visibleSelectors,
    onClickDisplaySelector,
    onClickAdjacentSelector,
    onClickTopLevelSelector,
    updateSelectorPreview,
  };
}

export function useCurrentSelector(contentType: string, defaultState: any = null) {
  const { updateSelectorPreview } = useSelectorHandlers();
  const updateSelector = Revisions.useStoreActions(a => a.updateCurrentSelector);
  const clearSelector = Revisions.useStoreActions(a => a.clearSelector);

  return useSelector(
    Revisions.useStoreState(s => s.resolvedSelectors.find(({ id }) => id === s.selector.currentSelectorId)),
    contentType,
    {
      selectorPreview: Revisions.useStoreState(s =>
        s.selector.currentSelectorId ? s.selector.selectorPreviewData[s.selector.currentSelectorId] : null
      ),
      updateSelectorPreview,
      updateSelector,
      clearSelector,
      defaultState,
    }
  );
}

/**
 * @deprecated
 * @param contentType
 */
export function useDisplaySelectors(contentType: string) {
  const {
    updateSelectorPreview,
    onClickAdjacentSelector,
    onClickDisplaySelector,
    onClickTopLevelSelector,
  } = useSelectorHandlers();

  const allSelectors = Revisions.useStoreState(state => {
    return {
      visibleCurrentLevelSelectorIds: state.visibleCurrentLevelSelectorIds,
      visibleAdjacentSelectors: state.visibleAdjacentSelectors,
      visibleCurrentLevelSelectors: state.visibleCurrentLevelSelectors,
      topLevelSelector: state.topLevelSelector,
    };
  });

  // Selector components.
  const selectorComponents = useSelectors(allSelectors.visibleCurrentLevelSelectors, contentType, {
    readOnly: true,
    onClick: onClickDisplaySelector,
    updateSelectorPreview,
  });

  const topLevelSelectorComponents = useSelector(allSelectors.topLevelSelector, contentType, {
    readOnly: true,
    isTopLevel: true,
    onClick: onClickTopLevelSelector,
    updateSelectorPreview,
  });

  const adjacentSelectorComponents = useSelectors(allSelectors.visibleAdjacentSelectors, contentType, {
    readOnly: true,
    isAdjacent: true,
    onClick: onClickAdjacentSelector,
    updateSelectorPreview,
  });

  return [
    allSelectors.visibleCurrentLevelSelectorIds,
    selectorComponents,
    topLevelSelectorComponents,
    adjacentSelectorComponents,
  ] as const;
}

export const SelectorRenderer = React.memo(_SelectorRenderer, (a, b) => {
  return (
    a.id === b.id &&
    a.selector.state === b.selector.state &&
    a.selector.revisionId === b.selector.revisionId &&
    Boolean(a.options.readOnly) === Boolean(b.options.readOnly) &&
    Boolean(a.options.isTopLevel) === Boolean(b.options.isTopLevel) &&
    Boolean(a.options.isAdjacent) === Boolean(b.options.isAdjacent) &&
    Boolean(a.options.hidden) === Boolean(b.options.hidden) &&
    Boolean(a.options.updateSelector) === Boolean(b.options.updateSelector) &&
    Boolean(a.options.selectorPreview) === Boolean(b.options.selectorPreview)
  );
});

function _SelectorRenderer({
  contentType,
  selector,
  options,
}: {
  id: any;
  contentType: string;
  selector: BaseSelector;
  options: {
    bucket: AnnotationBuckets;
    updateSelector?: any;
    selectorPreview?: any;
    updateSelectorPreview?: (data: { selectorId: string; preview: string }) => void;
    readOnly?: boolean;
    isTopLevel?: boolean;
    isAdjacent?: boolean;
    hidden?: boolean;
    defaultState?: any;
    onClick?: (s: any) => void;
  };
}) {
  const ctx = useContext(PluginContext);
  const ref = ctx.selectors[selector.type];
  if (!ref) {
    return null;
  }
  const Component = ref?.contentComponents?.atlas;
  if (!Component) {
    return null;
  }

  if (!selector.state && !options.readOnly) {
    selector.state = ref.defaultState;
  }

  return React.createElement(ref.contentComponents[contentType], {
    key: selector.id,
    ...selector,
    ...options,
  } as any);
}

export function useAllSelectors(
  contentType: string,
  selectorVisibility: {
    adjacentSelectors?: boolean;
    topLevelSelectors?: boolean;
    displaySelectors?: boolean;
    currentSelector?: boolean;
  } = {}
) {
  const selectors = Revisions.useStoreState(state => state.resolvedSelectors);
  const selectorHandlers = useSelectorHandlers();

  const topLevel = [];
  const currentLevel = [];
  const adjacent = [];
  const hidden = [];

  for (const selector of selectors) {
    if (selectorHandlers.visibleSelectors.current === selector.id) {
      continue;
    }

    if (selectorHandlers.visibleSelectors.topLevel === selector.id) {
      // The top level one.
      topLevel.push(
        React.createElement(SelectorRenderer, {
          key: selector.id,
          id: selector.id,
          contentType,
          selector,
          options: {
            bucket: 'topLevel',
            isTopLevel: true,
            hidden: !selectorVisibility.topLevelSelectors,
            readOnly: true,
            onClick: selectorHandlers.onClickTopLevelSelector,
            updateSelectorPreview: selectorHandlers.updateSelectorPreview,
          },
        })
      );
      continue;
    }

    if (selectorHandlers.visibleSelectors.currentLevel.indexOf(selector.id) !== -1) {
      // Render  current level.
      currentLevel.push(
        React.createElement(SelectorRenderer, {
          key: selector.id,
          id: selector.id,
          contentType,
          selector,
          options: {
            bucket: 'currentLevel',
            hidden: !selectorVisibility.currentSelector,
            readOnly: true,
            onClick: selectorHandlers.onClickDisplaySelector,
            updateSelectorPreview: selectorHandlers.updateSelectorPreview,
          },
        })
      );
      continue;
    }

    if (selectorHandlers.visibleSelectors.adjacent.indexOf(selector.id) !== -1) {
      // Render adjacent level.
      adjacent.push(
        React.createElement(SelectorRenderer, {
          key: selector.id,
          id: selector.id,
          contentType,
          selector,
          options: {
            bucket: 'adjacent',
            isAdjacent: true,
            readOnly: true,
            onClick: selectorHandlers.onClickAdjacentSelector,
            hidden: !selectorVisibility.adjacentSelectors,
          },
        })
      );
      continue;
    }

    // Render hidden selectors.
    hidden.push(
      React.createElement(SelectorRenderer, {
        key: selector.id,
        id: selector.id,
        contentType,
        selector,
        options: {
          bucket: 'hidden',
          hidden: true,
          readOnly: true,
        },
      })
    );
  }

  return [...adjacent, ...currentLevel, ...topLevel, ...hidden];
}
