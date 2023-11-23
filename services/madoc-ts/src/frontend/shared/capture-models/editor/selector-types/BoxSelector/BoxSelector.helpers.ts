import { AnnotationBuckets } from '../../../../../../types/annotation-styles';
import { useAnnotationStyles } from '../../../AnnotationStyleContext';
import { SelectorTypeProps } from '../../../types/selector-types';
import { useSelectorController, useSelectorEvents } from '../../stores/selectors/selector-helper';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BoxSelectorProps } from './BoxSelector';

export function useBoxSelector(
  {
    id,
    state,
    updateSelectorPreview,
    updateSelector,
    readOnly,
    isAdjacent,
    isTopLevel,
    bucket,
  }: SelectorTypeProps<BoxSelectorProps>,
  { generatePreview }: { generatePreview?: (s?: BoxSelectorProps['state']) => string | undefined } = {}
) {
  const { controller, isHighlighted, onClick, onHover } = useSelectorEvents(id);
  const lastPreview = useRef<string | undefined>();
  const styles = useAnnotationStyles();
  const style =
    isHighlighted && bucket === 'currentLevel' ? styles.highlighted : styles[bucket || 'hidden'] || styles.hidden;

  // Controller effects.
  useEffect(() => {
    return controller
      .withSelector(id)
      .on<any>(
        'image-preview-request',
        (ev?: { selectorId: string; resolve: (preview?: string) => void; reject: () => void }) => {
          if (ev && generatePreview) {
            if (state) {
              ev.resolve(generatePreview(state));
            } else {
              ev.resolve();
            }
          }
        }
      );
  }, [controller, generatePreview, id, state]);

  useEffect(() => {
    if (updateSelectorPreview && state && generatePreview) {
      const preview = generatePreview(state);
      if (preview && lastPreview.current !== preview) {
        lastPreview.current = preview;
        updateSelectorPreview({ selectorId: id, preview });
      }
    }
  }, [generatePreview, updateSelectorPreview, state, id]);

  const onSave = useCallback(
    (box: any) => {
      if (updateSelector) {
        updateSelector(box);
        controller.emit('selector-updated', { selectorId: id, state: box });
      }
    },
    [id, controller, updateSelector]
  );

  return {
    onSave,
    onClick,
    onHover,
    controller,
    isHighlighted,
    style,
  };
}
