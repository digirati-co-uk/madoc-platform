import { AnnotationBuckets } from '../../../../../../types/annotation-styles';
import { useAnnotationStyles } from '../../../AnnotationStyleContext';
import { SelectorTypeProps } from '../../../types/selector-types';
import { useSelectorController } from '../../stores/selectors/selector-helper';
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
  const controller = useSelectorController();
  const styles = useAnnotationStyles();
  const [isHighlighted, setIsHighlighted] = useState(false);
  const lastPreview = useRef<string | undefined>();
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
    return controller.withSelector(id).on('highlight', () => {
      setIsHighlighted(true);
    });
  }, [controller, id]);

  useEffect(() => {
    return controller.withSelector(id).on('clear-highlight', () => {
      setIsHighlighted(false);
    });
  }, [controller, id]);

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

  const onClick = useCallback(
    (e: { x: number; y: number; width: number; height: number }) => {
      controller.emit('click', { selectorId: id, event: e });
    },
    [id, controller]
  );

  return {
    onSave,
    onClick,
    controller,
    isHighlighted,
    style,
  };
}
