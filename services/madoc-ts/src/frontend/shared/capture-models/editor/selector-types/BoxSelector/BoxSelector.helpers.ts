import { SelectorTypeProps } from '../../../types/selector-types';
import { useSelectorController } from '../../stores/selectors/selector-helper';
import { useCallback, useEffect, useState } from 'react';
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
  }: SelectorTypeProps<BoxSelectorProps>,
  { generatePreview }: { generatePreview?: (s?: BoxSelectorProps['state']) => string | undefined } = {}
) {
  const controller = useSelectorController();
  const [isHighlighted, setIsHighlighted] = useState(false);

  const backgroundColor = isHighlighted
    ? 'rgba(75, 103, 225, 0.4)'
    : !readOnly
    ? 'transparent'
    : isAdjacent
    ? 'rgba(141,160,203,.1)'
    : isTopLevel
    ? 'rgba(141,160,203,.4)'
    : 'rgba(252,141,98, .4)';

  const border = isHighlighted ? '5px solid #4B67E1' : isTopLevel ? '5px solid #000' : '5px solid rgba(5, 42, 68, 0.2)';

  // Controller effects.
  useEffect(() => {
    return controller
      .withSelector(id)
      .on(
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
      if (preview) {
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
    backgroundColor,
    border,
  };
}
